"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type RecruiterEmailFormState = {
  errorMessage?: string;
  successMessage?: string;
};

type RecruiterEmailFormProps = {
  applicationId: string;
  candidateEmail: string;
  action: (
    state: RecruiterEmailFormState,
    formData: FormData,
  ) => Promise<RecruiterEmailFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send email"}
    </button>
  );
}

export function RecruiterEmailForm({ applicationId, candidateEmail, action }: RecruiterEmailFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="applicationId" value={applicationId} />
      <p className="text-xs text-slate-500">
        Sends to <span className="font-medium text-slate-700">{candidateEmail}</span> via your
        configured email provider (mock logs to the server console). Works even when the AI score is
        below the shortlist threshold.
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
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Subject</span>
        <input
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Update on your application"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Message</span>
        <textarea
          name="body"
          rows={6}
          required
          minLength={10}
          maxLength={8000}
          placeholder="Write a note to the candidate…"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
