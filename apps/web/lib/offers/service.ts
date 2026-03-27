import { randomUUID } from "node:crypto";

import { ActorType, ApplicationStatus, SignatureStatus } from "@prisma/client";
import { OpenAIClient, generateOfferDraftWithAI } from "@hiring-workflow/ai-engine";

import { db } from "../db";
import { env } from "../env";
import { offerFormSchema, type OfferFormInput } from "./schema";

function parseDecimal(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function generateAndStoreOffer(input: OfferFormInput) {
  const parsed = offerFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      errorMessage: parsed.error.flatten().formErrors[0] ?? "Invalid offer request.",
    };
  }

  const application = await db.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: {
      id: true,
      candidateId: true,
      jobId: true,
      currentStatus: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!application) {
    return {
      ok: false as const,
      errorMessage: "Application not found.",
    };
  }

  if (!env.OPENAI_API_KEY) {
    return {
      ok: false as const,
      errorMessage: "OPENAI_API_KEY is not configured.",
    };
  }

  const provider = new OpenAIClient({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  });

  const candidateName = `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
  const offerDraft = await generateOfferDraftWithAI(provider, {
    candidateName,
    companyName: "AI Hiring Workflow",
    title: parsed.data.title,
    startDate: parsed.data.startDate,
    baseSalary: parsed.data.baseSalary.trim(),
    equity: parsed.data.equity || null,
    bonus: parsed.data.bonus || null,
    managerName: parsed.data.managerName,
    customTerms: parsed.data.customTerms || null,
  });

  const baseSalary = parseDecimal(parsed.data.baseSalary);
  if (baseSalary === null) {
    return {
      ok: false as const,
      errorMessage: "Base salary must be a valid number.",
    };
  }

  const equity = parseDecimal(parsed.data.equity);
  const bonus = parseDecimal(parsed.data.bonus);
  const nextStatus = ApplicationStatus.OFFER_DRAFT;
  const shouldWriteStatusHistory = application.currentStatus !== nextStatus;

  await db.$transaction(async (tx) => {
    await tx.offer.upsert({
      where: { applicationId: application.id },
      update: {
        title: parsed.data.title,
        startDate: new Date(parsed.data.startDate),
        baseSalary,
        equity,
        bonus,
        managerName: parsed.data.managerName,
        customTerms: parsed.data.customTerms || null,
        offerText: offerDraft.offerText,
        signatureProvider: "mock-esign",
        signatureStatus: SignatureStatus.DRAFT,
      },
      create: {
        applicationId: application.id,
        signatureToken: randomUUID(),
        title: parsed.data.title,
        startDate: new Date(parsed.data.startDate),
        baseSalary,
        equity,
        bonus,
        managerName: parsed.data.managerName,
        customTerms: parsed.data.customTerms || null,
        offerText: offerDraft.offerText,
        signatureProvider: "mock-esign",
        signatureStatus: SignatureStatus.DRAFT,
      },
    });

    await tx.application.update({
      where: { id: application.id },
      data: {
        currentStatus: nextStatus,
        reviewedAt: new Date(),
      },
    });

    if (shouldWriteStatusHistory) {
      await tx.candidateStatusHistory.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          fromStatus: application.currentStatus,
          toStatus: nextStatus,
          actorType: ActorType.ADMIN,
          note: "Admin generated an offer draft.",
        },
      });
    }

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.ADMIN,
        eventType: "offer.generated",
        note: "Offer draft generated for candidate review.",
        payloadJson: {
          title: parsed.data.title,
          startDate: parsed.data.startDate,
          baseSalary,
          equity,
          bonus,
          managerName: parsed.data.managerName,
          signatureStatus: SignatureStatus.DRAFT,
        },
      },
    });
  });

  return {
    ok: true as const,
    successMessage: "Offer draft generated successfully.",
  };
}

export async function getOfferFormDetail(applicationId: string) {
  return db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      currentStatus: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      job: {
        select: {
          title: true,
          team: true,
        },
      },
      offer: {
        select: {
          id: true,
          title: true,
          startDate: true,
          baseSalary: true,
          equity: true,
          bonus: true,
          managerName: true,
          customTerms: true,
          offerText: true,
          signatureToken: true,
          signatureProvider: true,
          signatureStatus: true,
        },
      },
    },
  });
}

export async function ensureOfferSignatureToken(applicationId: string) {
  const existingOffer = await db.offer.findUnique({
    where: { applicationId },
    select: {
      id: true,
      signatureToken: true,
    },
  });

  if (!existingOffer) {
    return null;
  }

  if (existingOffer.signatureToken) {
    return existingOffer.signatureToken;
  }

  const updatedOffer = await db.offer.update({
    where: { id: existingOffer.id },
    data: {
      signatureToken: randomUUID(),
    },
    select: {
      signatureToken: true,
    },
  });

  return updatedOffer.signatureToken;
}
