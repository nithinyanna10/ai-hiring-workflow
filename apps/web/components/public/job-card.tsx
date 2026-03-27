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
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{job.team}</span>
            <span aria-hidden="true">/</span>
            <span>{job.location}</span>
            <span aria-hidden="true">/</span>
            <span>{job.workModel}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                <Link href={`/careers/${job.slug}`} className="no-underline hover:underline">
                  {job.title}
                </Link>
              </h2>
              <p className="text-sm font-medium text-slate-600">{job.level}</p>
            </div>
            <Link
              href={`/apply/${job.slug}`}
              className="rounded border border-slate-300 px-3 py-2 text-sm no-underline"
            >
              Apply
            </Link>
          </div>
        </div>

        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {buildSummary(job.description)}
        </p>
      </div>
    </article>
  );
}
