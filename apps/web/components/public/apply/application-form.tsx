"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { ApplyJobOption } from "../../../types";
import type { ApplicationActionState } from "../../../lib/applications/types";

type ApplicationFormProps = {
  initialState: ApplicationActionState;
  action: (state: ApplicationActionState, formData: FormData) => Promise<ApplicationActionState>;
  jobs: ApplyJobOption[];
  defaultJobSlug: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit application"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-red-600">{errors[0]}</p>;
}

export function ApplicationForm({
  initialState,
  action,
  jobs,
  defaultJobSlug,
}: ApplicationFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-border bg-white p-6">
      {state.errorMessage ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            type="text"
            name="fullName"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="Jordan Lee"
          />
          <FieldError errors={state.fieldErrors?.fullName} />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="jordan@example.com"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">LinkedIn URL</span>
          <input
            type="url"
            name="linkedinUrl"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://www.linkedin.com/in/jordan-lee"
          />
          <FieldError errors={state.fieldErrors?.linkedinUrl} />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">GitHub or portfolio URL</span>
          <input
            type="url"
            name="portfolioUrl"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://github.com/jordanlee"
          />
          <FieldError errors={state.fieldErrors?.portfolioUrl} />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            name="jobSlug"
            defaultValue={defaultJobSlug}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.slug}>
                {job.title} · {job.location} · {job.workModel}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.jobSlug} />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Resume</span>
          <input
            type="file"
            name="resume"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm"
          />
          <p className="text-xs text-slate-500">PDF or DOCX only, up to 5MB.</p>
          <FieldError errors={state.fieldErrors?.resume} />
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}
