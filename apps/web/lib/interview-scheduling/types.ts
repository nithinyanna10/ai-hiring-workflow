import type { ApplicationStatus, SlotStatus } from "@prisma/client";

export type HeldSlotInput = {
  startTime: Date;
  timezone?: string;
  interviewerName?: string;
  meetingLocation?: string;
};

export type CreateHeldSlotsInput = {
  applicationId: string;
  slotStarts: HeldSlotInput[];
  holdExpiresAt: Date;
};

export type ConfirmSlotInput = {
  applicationId: string;
  slotId: string;
  reservationToken: string;
  lockVersion: number;
  interviewType: string;
  interviewerName?: string;
  interviewerEmail?: string;
  meetingUrl?: string;
};

export type SchedulingResult =
  | {
      ok: true;
      slotId?: string;
      releasedCount?: number;
      expiredCount?: number;
      applicationStatus?: ApplicationStatus;
      slotStatus?: SlotStatus;
    }
  | {
      ok: false;
      error: string;
    };

export type ReleaseSiblingSlotsInput = {
  applicationId: string;
  selectedSlotId: string;
};
