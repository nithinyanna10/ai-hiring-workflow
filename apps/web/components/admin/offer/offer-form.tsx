"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type OfferActionState = {
  errorMessage?: string;
  successMessage?: string;
};

type OfferFormProps = {
  applicationId: string;
  defaultValues?: {
    title?: string | null;
    startDate?: string | null;
    baseSalary?: string | null;
    equity?: string | null;
    bonus?: string | null;
    managerName?: string | null;
    customTerms?: string | null;
  };
  action: (state: OfferActionState, formData: FormData) => Promise<OfferActionState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
    >
      {pending ? "Generating..." : "Generate offer draft"}
    </button>
  );
}

export function OfferForm({ applicationId, defaultValues, action }: OfferFormProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-border bg-white p-6">
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Confirmed job title</span>
          <input
            type="text"
            name="title"
            defaultValue={defaultValues?.title ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Start date</span>
          <input
            type="date"
            name="startDate"
            defaultValue={defaultValues?.startDate ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Base salary</span>
          <input
            type="number"
            name="baseSalary"
            defaultValue={defaultValues?.baseSalary ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Equity</span>
          <input
            type="number"
            step="0.0001"
            name="equity"
            defaultValue={defaultValues?.equity ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Bonus</span>
          <input
            type="number"
            name="bonus"
            defaultValue={defaultValues?.bonus ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Manager name</span>
          <input
            type="text"
            name="managerName"
            defaultValue={defaultValues?.managerName ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Custom terms</span>
          <textarea
            name="customTerms"
            rows={5}
            defaultValue={defaultValues?.customTerms ?? ""}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Add role-specific terms, contingencies, or approvals."
          />
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
