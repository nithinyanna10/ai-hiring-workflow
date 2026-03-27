"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type SchedulingActionState = {
  errorMessage?: string;
  successMessage?: string;
};

type AdminSlotGeneratorProps = {
  applicationId: string;
  action: (state: SchedulingActionState, formData: FormData) => Promise<SchedulingActionState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Generating..." : "Generate slot offers"}
    </button>
  );
}

export function AdminSlotGenerator({ applicationId, action }: AdminSlotGeneratorProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-border bg-white p-6">
      <input type="hidden" name="applicationId" value={applicationId} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Generate interview slots</h2>
        <p className="text-sm leading-6 text-slate-600">
          Provide 3 to 5 start times. Each slot will be created as a 45-minute held offer.
        </p>
      </div>

      {state.errorMessage ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </div>
      ) : null}

      {state.successMessage ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5].map((index) => (
          <label key={index} className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Slot start {index}</span>
            <input
              type="datetime-local"
              name={`slotStart${index}`}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              required={index <= 3}
            />
          </label>
        ))}

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Hold expires at</span>
          <input
            type="datetime-local"
            name="holdExpiresAt"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
