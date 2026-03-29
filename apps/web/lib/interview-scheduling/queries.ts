import { randomUUID } from "node:crypto";

import { ApplicationStatus, SlotStatus } from "@prisma/client";

import { db } from "../db";

export async function ensureSchedulingAccessToken(applicationId: string) {
  const existing = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      schedulingAccessToken: true,
    },
  });

  if (!existing) {
    throw new Error("Application not found.");
  }

  if (existing.schedulingAccessToken) {
    return existing.schedulingAccessToken;
  }

  const token = randomUUID();

  await db.application.update({
    where: { id: applicationId },
    data: {
      schedulingAccessToken: token,
    },
  });

  return token;
}

export async function getAdminSchedulingDetail(applicationId: string) {
  return db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      jobId: true,
      schedulingAccessToken: true,
      currentStatus: true,
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      job: {
        select: {
          title: true,
          team: true,
        },
      },
      interviewSlots: {
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          slotStatus: true,
          holdExpiresAt: true,
          reservationToken: true,
          lockVersion: true,
          timezone: true,
          interviewerName: true,
          meetingLocation: true,
        },
      },
    },
  });
}

export async function getCandidateSchedulingDetail(accessToken: string) {
  return db.application.findFirst({
    where: {
      schedulingAccessToken: accessToken,
    },
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
      interviewSlots: {
        where: {
          slotStatus: {
            in: [SlotStatus.HELD, SlotStatus.CONFIRMED, SlotStatus.EXPIRED, SlotStatus.RELEASED],
          },
        },
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          slotStatus: true,
          holdExpiresAt: true,
          reservationToken: true,
          lockVersion: true,
          timezone: true,
          interviewerName: true,
          meetingLocation: true,
          interview: {
            select: {
              id: true,
              meetingUrl: true,
            },
          },
        },
      },
    },
  });
}

const SCHEDULING_ELIGIBLE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.INTERVIEW_SCHEDULED,
];

export function canGenerateSchedulingOffers(status: ApplicationStatus) {
  return SCHEDULING_ELIGIBLE_STATUSES.includes(status);
}
