import type {
  CalendarAvailabilityRequest,
  CalendarAvailabilityResult,
  CalendarEventResult,
  CalendarInviteStatusResult,
  ConfirmInterviewInviteRequest,
  InviteStatusRequest,
  ReleaseHoldRequest,
  TentativeHoldRequest,
} from "./types";

export interface CalendarProvider {
  readonly name: string;
  getAvailability(input: CalendarAvailabilityRequest): Promise<CalendarAvailabilityResult>;
  createTentativeHold(input: TentativeHoldRequest): Promise<CalendarEventResult>;
  confirmInterviewInvite(input: ConfirmInterviewInviteRequest): Promise<CalendarEventResult>;
  releaseHold(input: ReleaseHoldRequest): Promise<CalendarEventResult>;
  getInviteStatus(input: InviteStatusRequest): Promise<CalendarInviteStatusResult>;
}
