export type CalendarAvailabilityWindow = {
  startTime: Date;
  endTime: Date;
  timezone: string;
};

export type CalendarAvailabilityRequest = {
  interviewerEmail: string;
  rangeStart: Date;
  rangeEnd: Date;
  durationMinutes: number;
  timezone: string;
};

export type CalendarAvailabilitySlot = {
  startTime: Date;
  endTime: Date;
  timezone: string;
};

export type CalendarAvailabilityResult = {
  success: boolean;
  slots: CalendarAvailabilitySlot[];
  error: string | null;
};

export type TentativeHoldRequest = {
  externalEventId?: string;
  interviewerEmail: string;
  attendeeEmail?: string | null;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
};

export type CalendarEventResult = {
  success: boolean;
  providerEventId: string | null;
  status: "held" | "confirmed" | "released" | "pending" | "unknown";
  joinUrl?: string | null;
  error: string | null;
};

export type ConfirmInterviewInviteRequest = {
  providerEventId: string;
  interviewerEmail: string;
  candidateEmail: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
};

export type ReleaseHoldRequest = {
  providerEventId: string;
  interviewerEmail: string;
};

export type InviteStatusRequest = {
  providerEventId: string;
  interviewerEmail: string;
};

export type CalendarInviteStatusResult = {
  success: boolean;
  status: "held" | "confirmed" | "released" | "canceled" | "unknown";
  providerEventId: string | null;
  error: string | null;
};
