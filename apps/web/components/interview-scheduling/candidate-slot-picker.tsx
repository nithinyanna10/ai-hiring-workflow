"use client";

import { SlotStatus } from "@prisma/client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type CandidateScheduleActionState = {
  errorMessage?: string;
};

type CandidateSlot = {
  id: string;
  startTime: string;
  endTime: string;
  slotStatus: SlotStatus;
  holdExpiresAt: string | null;
  reservationToken: string | null;
  lockVersion: number;
  timezone: string | null;
  interviewerName: string | null;
  meetingLocation: string | null;
};

type CandidateSlotPickerProps = {
  accessToken: string;
  applicationId: string;
  slots: CandidateSlot[];
  action: (state: CandidateScheduleActionState, formData: FormData) => Promise<CandidateScheduleActionState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Confirming..." : "Confirm slot"}
    </button>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CandidateSlotPicker({
  accessToken,
  applicationId,
  slots,
  action,
}: CandidateSlotPickerProps) {
  const [state, formAction] = useActionState(action, {});
  const availableSlots = slots.filter(
    (slot) => slot.slotStatus === SlotStatus.HELD && slot.reservationToken,
  );

  if (availableSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold tracking-tight">No available slots</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The offered interview slots have expired or already been taken.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-white p-6">
      <input type="hidden" name="accessToken" value={accessToken} />
      <input type="hidden" name="applicationId" value={applicationId} />

      {state.errorMessage ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </div>
      ) : null}

      <fieldset className="space-y-3">
        {availableSlots.map((slot, index) => (
          <label key={slot.id} className="flex items-start gap-3 rounded border border-slate-200 p-4">
            <input
              type="radio"
              name="slotId"
              value={slot.id}
              defaultChecked={index === 0}
              className="mt-1"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                {formatDateTime(slot.startTime)} to {formatDateTime(slot.endTime)}
              </p>
              <p className="text-sm text-slate-600">
                {slot.timezone ?? "Timezone TBD"} · {slot.interviewerName ?? "Interviewer TBD"}
              </p>
              <p className="text-sm text-slate-500">
                Expires {slot.holdExpiresAt ? formatDateTime(slot.holdExpiresAt) : "soon"}
              </p>
            </div>
          </label>
        ))}
      </fieldset>

      <SelectedSlotFields slots={availableSlots} />
      <SubmitButton />
    </form>
  );
}

function SelectedSlotFields({ slots }: { slots: CandidateSlot[] }) {
  return (
    <>
      {slots.map((slot) => (
        <div key={slot.id} className="hidden">
          <input type="hidden" name={`reservationToken:${slot.id}`} value={slot.reservationToken ?? ""} />
          <input type="hidden" name={`lockVersion:${slot.id}`} value={String(slot.lockVersion)} />
        </div>
      ))}
    </>
  );
}
