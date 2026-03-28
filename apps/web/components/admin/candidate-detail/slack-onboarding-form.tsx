"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type SlackOnboardingSimulateState = {
  errorMessage?: string;
  successMessage?: string;
};

type SlackOnboardingFormProps = {
  applicationId: string;
  action: (
    state: SlackOnboardingSimulateState,
    formData: FormData,
  ) => Promise<SlackOnboardingSimulateState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-teal-600 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 disabled:opacity-60"
    >
      {pending ? "Running…" : "Simulate Slack join & complete welcome"}
    </button>
  );
}

export function SlackOnboardingForm({ applicationId, action }: SlackOnboardingFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />

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

      <SubmitButton />
    </form>
  );
}
