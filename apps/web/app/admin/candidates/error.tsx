"use client";

export default function AdminCandidatesError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-red-200 bg-white p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-600">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Unable to load candidates</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The candidates list could not be loaded right now. Try the request again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
