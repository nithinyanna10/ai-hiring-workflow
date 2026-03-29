import { ActorType } from "@prisma/client";
import { z } from "zod";

import { db } from "../db";
import { sendEmail } from "../email/send-email";

const sendSchema = z.object({
  applicationId: z.string().trim().min(1),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(200),
  body: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(8000, "Message is too long."),
});

export type SendRecruiterEmailInput = z.infer<typeof sendSchema>;

export type SendRecruiterEmailResult =
  | { ok: true; messageId?: string }
  | { ok: false; errorMessage: string };

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends a manual recruiter email to the candidate. Independent of AI screening score or shortlist status.
 */
export async function sendRecruiterEmailToCandidate(
  input: SendRecruiterEmailInput,
): Promise<SendRecruiterEmailResult> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errorMessage: parsed.error.flatten().formErrors[0] ?? "Invalid input.",
    };
  }

  const application = await db.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: {
      id: true,
      candidateId: true,
      jobId: true,
      candidate: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      job: { select: { title: true } },
    },
  });

  if (!application) {
    return { ok: false, errorMessage: "Application not found." };
  }

  const candidateName =
    `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
  const { subject, body } = parsed.data;

  const text = [`Hi ${candidateName},`, "", body, "", `— Regarding: ${application.job.title}`].join(
    "\n",
  );

  const html = [
    `<p>Hi ${escapeHtml(candidateName)},</p>`,
    `<div style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5">${escapeHtml(body)}</div>`,
    `<p style="margin-top:1.5rem;color:#64748b;font-size:12px">Regarding: ${escapeHtml(application.job.title)}</p>`,
  ].join("");

  try {
    const result = await sendEmail({
      flow: "recruiter_manual",
      to: application.candidate.email,
      subject,
      text,
      html,
    });

    await db.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.RECRUITER,
        eventType: "recruiter.manual_email_sent",
        note: `Recruiter sent email to candidate: ${subject}`,
        payloadJson: {
          subject,
          provider: result.provider,
          messageId: result.messageId ?? null,
        },
      },
    });

    return { ok: true, messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    await db.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.RECRUITER,
        eventType: "recruiter.manual_email_failed",
        note: message,
        payloadJson: { subject },
      },
    });
    return { ok: false, errorMessage: message };
  }
}
