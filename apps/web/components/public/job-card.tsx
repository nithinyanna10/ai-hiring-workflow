import Link from "next/link";

import type { PublicJobSummary } from "../../types";

type JobCardProps = {
  job: PublicJobSummary;
};

function buildSummary(description: string) {
  const trimmed = description.trim();
  if (trimmed.length <= 180) {
    return trimmed;
  }

  return `${trimmed.slice(0, 177).trimEnd()}...`;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="rounded-lg border border-border bg-white shadow-sm transition hover:border-slate-300">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:justify-between">
        <Link
          href={`/careers/${job.slug}`}
          className="min-w-0 flex-1 space-y-4 no-underline"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{job.team}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{job.level}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{job.location}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{job.workModel}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 underline-offset-4 hover:underline">
              {job.title}
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {buildSummary(job.description)}
          </p>
          <p className="text-xs font-medium text-slate-500">View role details →</p>
        </Link>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href={`/apply/${job.slug}`}
            className="inline-flex justify-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 no-underline hover:bg-slate-50"
          >
            Apply
          </Link>
        </div>
      </div>
    </article>
  );
}
