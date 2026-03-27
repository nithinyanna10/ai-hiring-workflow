import type { CalendarProvider } from "../provider";
import type {
  CalendarAvailabilityRequest,
  CalendarAvailabilityResult,
  CalendarEventResult,
  CalendarInviteStatusResult,
  ConfirmInterviewInviteRequest,
  InviteStatusRequest,
  ReleaseHoldRequest,
  TentativeHoldRequest,
} from "../types";

export type GoogleCalendarProviderConfig = {
  accessToken: string;
  calendarId?: string;
  baseUrl?: string;
};

export class GoogleCalendarProvider implements CalendarProvider {
  readonly name = "google-calendar";

  private readonly accessToken: string;
  private readonly calendarId: string;
  private readonly baseUrl: string;

  constructor(config: GoogleCalendarProviderConfig) {
    this.accessToken = config.accessToken;
    this.calendarId = config.calendarId ?? "primary";
    this.baseUrl = config.baseUrl ?? "https://www.googleapis.com/calendar/v3";
  }

  async getAvailability(
    _input: CalendarAvailabilityRequest,
  ): Promise<CalendarAvailabilityResult> {
    return {
      success: false,
      slots: [],
      error:
        "Google Calendar availability lookup is not implemented yet. Use the mock provider for scheduling flows.",
    };
  }

  async createTentativeHold(_input: TentativeHoldRequest): Promise<CalendarEventResult> {
    return {
      success: false,
      providerEventId: null,
      status: "unknown",
      joinUrl: null,
      error:
        "Google Calendar tentative hold creation is not implemented yet. Use the mock provider for scheduling flows.",
    };
  }

  async confirmInterviewInvite(
    _input: ConfirmInterviewInviteRequest,
  ): Promise<CalendarEventResult> {
    return {
      success: false,
      providerEventId: null,
      status: "unknown",
      joinUrl: null,
      error:
        "Google Calendar invite confirmation is not implemented yet. Use the mock provider for scheduling flows.",
    };
  }

  async releaseHold(_input: ReleaseHoldRequest): Promise<CalendarEventResult> {
    return {
      success: false,
      providerEventId: null,
      status: "unknown",
      joinUrl: null,
      error:
        "Google Calendar hold release is not implemented yet. Use the mock provider for scheduling flows.",
    };
  }

  async getInviteStatus(_input: InviteStatusRequest): Promise<CalendarInviteStatusResult> {
    return {
      success: false,
      status: "unknown",
      providerEventId: null,
      error:
        "Google Calendar invite status lookup is not implemented yet. Use the mock provider for scheduling flows.",
    };
  }

  getConfigSummary() {
    return {
      calendarId: this.calendarId,
      baseUrl: this.baseUrl,
      hasAccessToken: Boolean(this.accessToken),
    };
  }
}
