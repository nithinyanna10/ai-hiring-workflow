"use server";

import { revalidatePath } from "next/cache";
import { ActorType, SlotStatus } from "@prisma/client";

import { db } from "../../../../../lib/db";
import { sendSchedulingNudgeEmail } from "../../../../../lib/email/send-scheduling-nudge";
import { sendSchedulingSlotsOfferEmail } from "../../../../../lib/email/send-scheduling-slot-offer";
import { createHeldSlots } from "../../../../../lib/interview-scheduling";
import {
  ensureSchedulingAccessToken,
  getAdminSchedulingDetail,
} from "../../../../../lib/interview-scheduling/queries";
import { env } from "../../../../../lib/env";

type SchedulingActionState = {
  errorMessage?: string;
  successMessage?: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function parseDateTimeLocal(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function generateSlotOffersAction(
  _previousState: SchedulingActionState,
  formData: FormData,
): Promise<SchedulingActionState> {
  const applicationId = getStringValue(formData.get("applicationId"));
  const holdExpiresAtInput = getStringValue(formData.get("holdExpiresAt"));

  const holdExpiresAt = parseDateTimeLocal(holdExpiresAtInput);
  if (!holdExpiresAt) {
    return {
      errorMessage: "Provide a valid hold expiration date and time.",
    };
  }

  const slotStarts = [1, 2, 3, 4, 5]
    .map((index) => parseDateTimeLocal(getStringValue(formData.get(`slotStart${index}`))))
    .filter((value): value is Date => value instanceof Date);

  const result = await createHeldSlots({
    applicationId,
    slotStarts: slotStarts.map((startTime) => ({ startTime })),
    holdExpiresAt,
  });

  if (!result.ok) {
    return {
      errorMessage: result.error,
    };
  }

  const accessToken = await ensureSchedulingAccessToken(applicationId);
  const detail = await getAdminSchedulingDetail(applicationId);

  if (detail) {
    const held = detail.interviewSlots.filter((s) => s.slotStatus === SlotStatus.HELD);
    const heldExpiresAt = held.find((s) => s.holdExpiresAt)?.holdExpiresAt ?? null;

    if (held.length > 0 && heldExpiresAt) {
      const schedulingUrl = `${env.NEXT_PUBLIC_APP_URL}/schedule/${accessToken}`;
      const candidateName = `${detail.candidate.firstName} ${detail.candidate.lastName}`.trim();

      try {
        await sendSchedulingSlotsOfferEmail({
          to: detail.candidate.email,
          candidateName,
          roleTitle: detail.job.title,
          schedulingUrl,
          slots: held.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            timezone: s.timezone,
          })),
          holdExpiresAt: heldExpiresAt,
        });

        await db.activityEvent.create({
          data: {
            applicationId: detail.id,
            candidateId: detail.candidate.id,
            jobId: detail.jobId,
            actorType: ActorType.SYSTEM,
            eventType: "interview.scheduling_options_email_sent",
            note: "Email sent to candidate with offered slots and scheduling link.",
            payloadJson: {
              slotCount: held.length,
              flow: "scheduling_slots_offered",
            },
          },
        });
      } catch {
        await db.activityEvent.create({
          data: {
            applicationId: detail.id,
            candidateId: detail.candidate.id,
            jobId: detail.jobId,
            actorType: ActorType.SYSTEM,
            eventType: "interview.scheduling_options_email_failed",
            note: "Slot offers were created but the scheduling email could not be sent (check logs / EMAIL_PROVIDER).",
          },
        });
      }
    }
  }

  revalidatePath(`/admin/candidates/${applicationId}/schedule`);
  revalidatePath(`/admin/candidates/${applicationId}`);

  return {
    successMessage: "Interview slot offers generated.",
  };
}

type NudgeActionState = {
  errorMessage?: string;
  successMessage?: string;
};

export async function sendSchedulingReminderAction(
  _previousState: NudgeActionState,
  formData: FormData,
): Promise<NudgeActionState> {
  const applicationId = getStringValue(formData.get("applicationId"));

  const detail = await getAdminSchedulingDetail(applicationId);
  if (!detail) {
    return { errorMessage: "Application not found." };
  }

  const hasHeld = detail.interviewSlots.some((s) => s.slotStatus === SlotStatus.HELD);
  if (!hasHeld) {
    return {
      errorMessage: "No held slots to remind about. Generate slot offers first.",
    };
  }

  const accessToken = await ensureSchedulingAccessToken(applicationId);
  const schedulingUrl = `${env.NEXT_PUBLIC_APP_URL}/schedule/${accessToken}`;
  const candidateName = `${detail.candidate.firstName} ${detail.candidate.lastName}`.trim();

  try {
    await sendSchedulingNudgeEmail({
      to: detail.candidate.email,
      candidateName,
      roleTitle: detail.job.title,
      schedulingUrl,
    });

    await db.activityEvent.create({
      data: {
        applicationId: detail.id,
        candidateId: detail.candidate.id,
        jobId: detail.jobId,
        actorType: ActorType.SYSTEM,
        eventType: "interview.scheduling_followup_nudge_sent",
        note: "Follow-up reminder email sent (48h-style nudge path; manual trigger in demo).",
        payloadJson: { flow: "scheduling_followup_nudge" },
      },
    });

    revalidatePath(`/admin/candidates/${applicationId}/schedule`);
    revalidatePath(`/admin/candidates/${applicationId}`);

    return { successMessage: "Reminder email sent to the candidate." };
  } catch {
    return { errorMessage: "Could not send reminder email (check EMAIL_PROVIDER and logs)." };
  }
}
