"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type SchedulingReminderState = {
  errorMessage?: string;
  successMessage?: string;
};

type SchedulingReminderFormProps = {
  applicationId: string;
  action: (
    state: SchedulingReminderState,
    formData: FormData,
  ) => Promise<SchedulingReminderState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send reminder email"}
    </button>
  );
}

export function SchedulingReminderForm({ applicationId, action }: SchedulingReminderFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <p className="text-sm leading-6 text-slate-600">
        Sends a follow-up nudge to pick a slot (use for a 48-hour reminder in demos; production would
        schedule this from a job queue).
      </p>
      {state.errorMessage ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.errorMessage}
        </div>
      ) : null}
      {state.successMessage ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.successMessage}
        </div>
      ) : null}
      <SubmitButton />
    </form>
  );
}
