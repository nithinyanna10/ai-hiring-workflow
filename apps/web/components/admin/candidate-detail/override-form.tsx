"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AdminOverrideState } from "../../../lib/admin/candidate-detail";

type OverrideFormProps = {
  applicationId: string;
  action: (state: AdminOverrideState, formData: FormData) => Promise<AdminOverrideState>;
};

function SubmitButton({ value, label }: { value: string; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="targetStatus"
      value={value}
      disabled={pending}
      className="rounded border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CandidateOverrideForm({ applicationId, action }: OverrideFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-white p-6">
      <input type="hidden" name="applicationId" value={applicationId} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Admin override</h2>
        <p className="text-sm leading-6 text-slate-600">
          Use manual overrides when recruiter judgment needs to supersede the automated outcome.
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

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Override note</span>
        <textarea
          name="note"
          rows={4}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Explain why this application is being manually updated."
          required
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <SubmitButton value="SHORTLISTED" label="Manually shortlist" />
        <SubmitButton value="REJECTED" label="Manually reject" />
      </div>
    </form>
  );
}
