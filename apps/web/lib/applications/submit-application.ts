import { ActorType, ApplicationStatus, JobStatus, Prisma } from "@prisma/client";

import { db } from "../db";
import { getEmailProvider } from "../email/provider";
import { sendApplicationConfirmation } from "../email/send-application-confirmation";
import { orchestrateApplicationScreening } from "../screening/orchestrate-application-screening";
import type { ApplicationFormInput } from "./schema";
import { deleteStoredResume, storeResumeFile } from "./storage";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function splitFullName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ") || "Unknown",
  };
}

export async function submitApplication(input: ApplicationFormInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const selectedJob = await db.job.findUnique({
    where: { slug: input.jobSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });

  if (!selectedJob || selectedJob.status !== JobStatus.OPEN) {
    const statusLabel = selectedJob?.status.toLowerCase() ?? "unavailable";

    return {
      ok: false as const,
      code: "ROLE_UNAVAILABLE" as const,
      message: `This role is currently ${statusLabel} and is not accepting applications.`,
    };
  }

  const existingCandidate = await db.candidate.findUnique({
    where: { emailNormalized: normalizedEmail },
    select: { id: true },
  });

  if (existingCandidate) {
    const duplicateApplication = await db.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: existingCandidate.id,
          jobId: selectedJob.id,
        },
      },
      select: { id: true },
    });

    if (duplicateApplication) {
      return {
        ok: false as const,
        code: "DUPLICATE_APPLICATION" as const,
        message: "An application already exists for this email address and role.",
      };
    }
  }

  const { resumeFileUrl, absoluteFilePath } = await storeResumeFile({
    email: normalizedEmail,
    jobSlug: selectedJob.slug,
    resume: input.resume,
  });

  try {
    const { firstName, lastName } = splitFullName(input.fullName);

    const result = await db.$transaction(async (tx) => {
      const candidate = await tx.candidate.upsert({
        where: { emailNormalized: normalizedEmail },
        update: {
          email: input.email.trim(),
          firstName,
          lastName,
          linkedinUrl: input.linkedinUrl.trim(),
          portfolioUrl: input.portfolioUrl?.trim() || null,
        },
        create: {
          email: input.email.trim(),
          emailNormalized: normalizedEmail,
          firstName,
          lastName,
          linkedinUrl: input.linkedinUrl.trim(),
          portfolioUrl: input.portfolioUrl?.trim() || null,
        },
      });

      const application = await tx.application.create({
        data: {
          candidateId: candidate.id,
          jobId: selectedJob.id,
          resumeFileUrl,
          currentStatus: ApplicationStatus.APPLIED,
        },
      });

      await tx.candidateStatusHistory.create({
        data: {
          applicationId: application.id,
          candidateId: candidate.id,
          fromStatus: null,
          toStatus: ApplicationStatus.APPLIED,
          actorType: ActorType.CANDIDATE,
          note: "Candidate submitted an application through the public careers portal.",
        },
      });

      await tx.activityEvent.create({
        data: {
          applicationId: application.id,
          candidateId: candidate.id,
          jobId: selectedJob.id,
          actorType: ActorType.CANDIDATE,
          eventType: "application.submitted",
          note: `Application submitted for ${selectedJob.title}.`,
          payloadJson: {
            source: "public-careers-page",
            resumeFileUrl,
          },
        },
      });

      return {
        applicationId: application.id,
        jobSlug: selectedJob.slug,
        candidateId: candidate.id,
        candidateName: `${firstName} ${lastName}`.trim(),
        candidateEmail: input.email.trim(),
        roleTitle: selectedJob.title,
      };
    });

    try {
      const emailResult = await sendApplicationConfirmation({
        candidateEmail: result.candidateEmail,
        candidateName: result.candidateName,
        roleTitle: result.roleTitle,
      });

      await db.activityEvent.create({
        data: {
          applicationId: result.applicationId,
          candidateId: result.candidateId,
          jobId: selectedJob.id,
          actorType: ActorType.SYSTEM,
          eventType: "application.confirmation_email_sent",
          note: `Confirmation email sent to ${result.candidateEmail}.`,
          payloadJson: {
            provider: emailResult.provider,
            messageId: emailResult.messageId ?? null,
          },
        },
      });
    } catch (error) {
      const failureMessage =
        error instanceof Error ? error.message : "Unknown email delivery failure.";

      await db.activityEvent.create({
        data: {
          applicationId: result.applicationId,
          candidateId: result.candidateId,
          jobId: selectedJob.id,
          actorType: ActorType.SYSTEM,
          eventType: "application.confirmation_email_failed",
          note: `Confirmation email failed for ${result.candidateEmail}.`,
          payloadJson: {
            provider: getEmailProvider().name,
            error: failureMessage,
          },
        },
      });
    }

    await orchestrateApplicationScreening({
      applicationId: result.applicationId,
    }).catch(() => undefined);

    return {
      ok: true as const,
      applicationId: result.applicationId,
      jobSlug: result.jobSlug,
    };
  } catch (error) {
    await deleteStoredResume(absoluteFilePath);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false as const,
        code: "DUPLICATE_APPLICATION" as const,
        message: "An application already exists for this email address and role.",
      };
    }

    throw error;
  }
}
