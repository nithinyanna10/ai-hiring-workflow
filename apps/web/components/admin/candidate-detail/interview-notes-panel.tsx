"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export type MockNotetakerFormState = {
  errorMessage?: string;
  successMessage?: string;
};

type InterviewNotesPanelProps = {
  applicationId: string;
  interviews: Array<{
    id: string;
    transcriptText: string | null;
    feedbackSummary: string | null;
    notetakerProvider: string | null;
    completedAt: Date | null;
    slotStart: Date;
    slotEnd: Date;
  }>;
  action: (
    state: MockNotetakerFormState,
    formData: FormData,
  ) => Promise<MockNotetakerFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Ingesting…" : "Simulate notetaker (mock)"}
    </button>
  );
}

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function InterviewNotesPanel({ applicationId, interviews, action }: InterviewNotesPanelProps) {
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="space-y-6">
      {interviews.length === 0 ? (
        <p className="text-sm text-slate-600">
          No interview is on file yet. After the candidate confirms a slot, an interview record is
          created and you can ingest a mock transcript here.
        </p>
      ) : (
        <ul className="space-y-4">
          {interviews.map((row) => (
            <li key={row.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Slot {formatWhen(row.slotStart)} – {formatWhen(row.slotEnd)}
              </p>
              {row.notetakerProvider ? (
                <p className="mt-1 text-xs text-slate-500">
                  Provider: <span className="font-mono">{row.notetakerProvider}</span>
                  {row.completedAt ? (
                    <>
                      {" "}
                      · Completed {formatWhen(row.completedAt)}
                    </>
                  ) : null}
                </p>
              ) : null}
              {row.feedbackSummary ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-slate-800">AI summary</p>
                  <p className="text-sm leading-6 text-slate-700">{row.feedbackSummary}</p>
                </div>
              ) : null}
              {row.transcriptText ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-slate-800">Transcript</p>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700">
                    {row.transcriptText}
                  </pre>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Transcript not ingested yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 border-t border-slate-200 pt-4">
        <input type="hidden" name="applicationId" value={applicationId} />
        <p className="text-sm text-slate-600">
          Demo path: attach a deterministic mock transcript and summary to the latest interview (as
          if Fireflies or another notetaker posted a webhook).
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
    </div>
  );
}
