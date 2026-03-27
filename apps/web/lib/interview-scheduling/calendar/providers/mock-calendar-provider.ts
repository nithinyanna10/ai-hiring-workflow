import { randomUUID } from "node:crypto";

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

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60_000);
}

export class MockCalendarProvider implements CalendarProvider {
  readonly name = "mock-calendar";

  async getAvailability(
    input: CalendarAvailabilityRequest,
  ): Promise<CalendarAvailabilityResult> {
    const slots = [];
    let cursor = new Date(input.rangeStart);

    while (cursor < input.rangeEnd) {
      const endTime = addMinutes(cursor, input.durationMinutes);
      if (endTime <= input.rangeEnd) {
        slots.push({
          startTime: new Date(cursor),
          endTime,
          timezone: input.timezone,
        });
      }

      cursor = addMinutes(cursor, input.durationMinutes + 15);
    }

    return {
      success: true,
      slots,
      error: null,
    };
  }

  async createTentativeHold(_input: TentativeHoldRequest): Promise<CalendarEventResult> {
    return {
      success: true,
      providerEventId: `mock-hold-${randomUUID()}`,
      status: "held",
      joinUrl: null,
      error: null,
    };
  }

  async confirmInterviewInvite(
    input: ConfirmInterviewInviteRequest,
  ): Promise<CalendarEventResult> {
    return {
      success: true,
      providerEventId: input.providerEventId,
      status: "confirmed",
      joinUrl: `https://mock-calendar.local/invite/${input.providerEventId}`,
      error: null,
    };
  }

  async releaseHold(input: ReleaseHoldRequest): Promise<CalendarEventResult> {
    return {
      success: true,
      providerEventId: input.providerEventId,
      status: "released",
      joinUrl: null,
      error: null,
    };
  }

  async getInviteStatus(input: InviteStatusRequest): Promise<CalendarInviteStatusResult> {
    return {
      success: true,
      status: "unknown",
      providerEventId: input.providerEventId,
      error: null,
    };
  }
}
