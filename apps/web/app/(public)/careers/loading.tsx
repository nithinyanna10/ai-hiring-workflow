import { JobsLoadingState } from "../../../components/public/jobs-loading-state";

export default function CareersLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="mb-10 space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>
      <JobsLoadingState />
    </main>
  );
}
