"use client";

export default function AdminCandidateSchedulingError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-red-200 bg-white p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Unable to load scheduling</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The scheduling page could not be loaded right now.
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
