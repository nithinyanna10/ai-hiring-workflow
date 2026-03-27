import Link from "next/link";

import type { PublicJobDetail } from "../../types";

type JobDetailHeaderProps = {
  job: PublicJobDetail;
};

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
  return (
    <header className="space-y-4">
      <Link href="/careers" className="text-sm text-slate-500">
        Back to careers
      </Link>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>{job.team}</span>
          <span aria-hidden="true">/</span>
          <span>{job.location}</span>
          <span aria-hidden="true">/</span>
          <span>{job.workModel}</span>
          <span aria-hidden="true">/</span>
          <span>{job.level}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
      </div>
      <div>
        <Link
          href={`/apply/${job.slug}`}
          className="inline-flex rounded border border-slate-300 px-4 py-2 text-sm no-underline"
        >
          Apply for this role
        </Link>
      </div>
    </header>
  );
}
