import { randomUUID } from "node:crypto";

import { ActorType, ApplicationStatus, Prisma, SlotStatus } from "@prisma/client";

import { db } from "../db";
import {
  DEFAULT_HELD_SLOT_COUNT,
  INTERVIEW_SLOT_DURATION_MINUTES,
  MAX_HELD_SLOT_COUNT,
} from "./constants";
import type {
  ConfirmSlotInput,
  CreateHeldSlotsInput,
  ReleaseSiblingSlotsInput,
  SchedulingResult,
} from "./types";

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60_000);
}

function isExpired(holdExpiresAt: Date | null, now: Date) {
  return !holdExpiresAt || holdExpiresAt.getTime() <= now.getTime();
}

async function createSchedulingEvent(
  client: Prisma.TransactionClient,
  input: {
    applicationId: string;
    candidateId: string;
    jobId: string;
    eventType: string;
    note: string;
    payloadJson?: Record<string, unknown>;
  },
) {
  await client.activityEvent.create({
    data: {
      applicationId: input.applicationId,
      candidateId: input.candidateId,
      jobId: input.jobId,
      actorType: ActorType.SYSTEM,
      eventType: input.eventType,
      note: input.note,
      payloadJson: input.payloadJson,
    },
  });
}

async function releaseSiblingHeldSlots(
  client: Prisma.TransactionClient,
  applicationId: string,
  selectedSlotId: string,
) {
  const released = await client.interviewSlot.updateMany({
    where: {
      applicationId,
      slotStatus: SlotStatus.HELD,
      id: { not: selectedSlotId },
    },
    data: {
      slotStatus: SlotStatus.RELEASED,
      holdExpiresAt: null,
      reservationToken: null,
      lockVersion: {
        increment: 1,
      },
    },
  });

  return released.count;
}

export async function releaseSiblingSlots({
  applicationId,
  selectedSlotId,
}: ReleaseSiblingSlotsInput): Promise<SchedulingResult> {
  const releasedCount = await db.$transaction((tx) =>
    releaseSiblingHeldSlots(tx, applicationId, selectedSlotId),
  );

  return {
    ok: true,
    releasedCount,
  };
}

export async function createHeldSlots({
  applicationId,
  slotStarts,
  holdExpiresAt,
}: CreateHeldSlotsInput): Promise<SchedulingResult> {
  if (
    slotStarts.length < DEFAULT_HELD_SLOT_COUNT ||
    slotStarts.length > MAX_HELD_SLOT_COUNT
  ) {
    return {
      ok: false,
      error: `Held slot count must be between ${DEFAULT_HELD_SLOT_COUNT} and ${MAX_HELD_SLOT_COUNT}.`,
    };
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidateId: true,
      jobId: true,
    },
  });

  if (!application) {
    return {
      ok: false,
      error: "Application not found.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.interviewSlot.updateMany({
      where: {
        applicationId,
        slotStatus: SlotStatus.HELD,
      },
      data: {
        slotStatus: SlotStatus.RELEASED,
        holdExpiresAt: null,
        reservationToken: null,
        lockVersion: {
          increment: 1,
        },
      },
    });

    await tx.interviewSlot.createMany({
      data: slotStarts.map((slot) => ({
        applicationId,
        jobId: application.jobId,
        startTime: slot.startTime,
        endTime: addMinutes(slot.startTime, INTERVIEW_SLOT_DURATION_MINUTES),
        slotStatus: SlotStatus.HELD,
        holdExpiresAt,
        reservationToken: randomUUID(),
        lockVersion: 0,
        timezone: slot.timezone ?? null,
        interviewerName: slot.interviewerName ?? null,
        meetingLocation: slot.meetingLocation ?? null,
      })),
    });

    await createSchedulingEvent(tx, {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      eventType: "interview.slots_held",
      note: `Created ${slotStarts.length} held interview slots.`,
      payloadJson: {
        slotCount: slotStarts.length,
        holdExpiresAt: holdExpiresAt.toISOString(),
        slotDurationMinutes: INTERVIEW_SLOT_DURATION_MINUTES,
      },
    });
  });

  return {
    ok: true,
  };
}

export async function confirmSlot(input: ConfirmSlotInput): Promise<SchedulingResult> {
  const now = new Date();

  try {
    return await db.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: input.applicationId },
        select: {
          id: true,
          candidateId: true,
          jobId: true,
          currentStatus: true,
        },
      });

      if (!application) {
        return {
          ok: false,
          error: "Application not found.",
        };
      }

      const slot = await tx.interviewSlot.findUnique({
        where: { id: input.slotId },
        select: {
          id: true,
          applicationId: true,
          slotStatus: true,
          holdExpiresAt: true,
          reservationToken: true,
          lockVersion: true,
          startTime: true,
          endTime: true,
          interviewerName: true,
        },
      });

      if (!slot || slot.applicationId !== input.applicationId) {
        return {
          ok: false,
          error: "Interview slot not found for this application.",
        };
      }

      if (slot.slotStatus !== SlotStatus.HELD) {
        return {
          ok: false,
          error: "Selected slot is no longer held.",
        };
      }

      if (isExpired(slot.holdExpiresAt, now)) {
        await tx.interviewSlot.update({
          where: { id: slot.id },
          data: {
            slotStatus: SlotStatus.EXPIRED,
            holdExpiresAt: null,
            reservationToken: null,
            lockVersion: {
              increment: 1,
            },
          },
        });

        await createSchedulingEvent(tx, {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.jobId,
          eventType: "interview.slot_expired",
          note: "Selected held interview slot expired before confirmation.",
          payloadJson: {
            slotId: slot.id,
          },
        });

        return {
          ok: false,
          error: "Selected slot has expired.",
        };
      }

      const confirmedUpdate = await tx.interviewSlot.updateMany({
        where: {
          id: slot.id,
          applicationId: input.applicationId,
          slotStatus: SlotStatus.HELD,
          reservationToken: input.reservationToken,
          lockVersion: input.lockVersion,
          holdExpiresAt: {
            gt: now,
          },
        },
        data: {
          slotStatus: SlotStatus.CONFIRMED,
          holdExpiresAt: null,
          lockVersion: {
            increment: 1,
          },
        },
      });

      if (confirmedUpdate.count !== 1) {
        return {
          ok: false,
          error: "Slot confirmation failed because the hold is no longer valid.",
        };
      }

      const releasedCount = await releaseSiblingHeldSlots(tx, input.applicationId, slot.id);

      await tx.interview.create({
        data: {
          applicationId: application.id,
          interviewSlotId: slot.id,
          interviewType: input.interviewType,
          interviewerName: input.interviewerName ?? slot.interviewerName ?? null,
          interviewerEmail: input.interviewerEmail ?? null,
          meetingUrl: input.meetingUrl ?? null,
        },
      });

      await tx.application.update({
        where: { id: application.id },
        data: {
          currentStatus: ApplicationStatus.INTERVIEW_SCHEDULED,
          reviewedAt: now,
        },
      });

      await tx.candidateStatusHistory.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          fromStatus: application.currentStatus,
          toStatus: ApplicationStatus.INTERVIEW_SCHEDULED,
          actorType: ActorType.SYSTEM,
          note: "Interview slot confirmed and interview scheduled.",
        },
      });

      await createSchedulingEvent(tx, {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        eventType: "interview.slot_confirmed",
        note: "Interview slot confirmed.",
        payloadJson: {
          slotId: slot.id,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          releasedSiblingSlots: releasedCount,
        },
      });

      return {
        ok: true,
        slotId: slot.id,
        releasedCount,
        applicationStatus: ApplicationStatus.INTERVIEW_SCHEDULED,
        slotStatus: SlotStatus.CONFIRMED,
      };
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Interview confirmation failed.",
    };
  }
}

export async function expireHeldSlots(now = new Date()): Promise<SchedulingResult> {
  const expiredSlots = await db.interviewSlot.findMany({
    where: {
      slotStatus: SlotStatus.HELD,
      holdExpiresAt: {
        lte: now,
      },
    },
    select: {
      id: true,
      applicationId: true,
      jobId: true,
      reservationToken: true,
    },
  });

  if (expiredSlots.length === 0) {
    return {
      ok: true,
      expiredCount: 0,
    };
  }

  await db.$transaction(async (tx) => {
    for (const slot of expiredSlots) {
      const updated = await tx.interviewSlot.updateMany({
        where: {
          id: slot.id,
          slotStatus: SlotStatus.HELD,
          holdExpiresAt: {
            lte: now,
          },
        },
        data: {
          slotStatus: SlotStatus.EXPIRED,
          holdExpiresAt: null,
          reservationToken: null,
          lockVersion: {
            increment: 1,
          },
        },
      });

      if (updated.count === 1 && slot.applicationId) {
        const application = await tx.application.findUnique({
          where: { id: slot.applicationId },
          select: {
            candidateId: true,
          },
        });

        if (application && slot.jobId) {
          await createSchedulingEvent(tx, {
            applicationId: slot.applicationId,
            candidateId: application.candidateId,
            jobId: slot.jobId,
            eventType: "interview.slot_expired",
            note: "Held interview slot expired.",
            payloadJson: {
              slotId: slot.id,
            },
          });
        }
      }
    }
  });

  return {
    ok: true,
    expiredCount: expiredSlots.length,
  };
}
