import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "../../../../components/public/apply/application-form";
import { defaultApplicationState, submitApplicationAction } from "./actions";
import { getJobBySlug, getOpenJobOptions } from "../../../../lib/db";
import { JobStatus } from "@prisma/client";
import type { RouteParams } from "../../../../types";

export const revalidate = 0;

export default async function ApplyPage({ params }: RouteParams<{ jobId: string }>) {
  const { jobId } = await params;
  const [job, openJobs] = await Promise.all([getJobBySlug(jobId), getOpenJobOptions()]);

  if (!job) {
    notFound();
  }

  if (job.status !== JobStatus.OPEN) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <div className="space-y-6 rounded-lg border border-border bg-white p-8">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Applications unavailable
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
            <p className="text-sm leading-6 text-slate-600">
              This role is currently {job.status.toLowerCase()} and is not accepting new
              applications.
            </p>
          </div>
          <Link href="/careers" className="inline-flex rounded border border-slate-300 px-4 py-2 text-sm no-underline">
            View other open roles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Apply
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Submit your application for the {job.team} team. We will review your materials and
          follow up with next steps if there is a fit.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-border bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Role:</span> {job.title}
        </p>
        <p>
          <span className="font-medium text-slate-900">Location:</span> {job.location} /{" "}
          {job.workModel}
        </p>
        <p>
          <span className="font-medium text-slate-900">Level:</span> {job.level}
        </p>
      </div>

      <ApplicationForm
        initialState={defaultApplicationState}
        action={submitApplicationAction.bind(null, job.slug)}
        jobs={openJobs}
        defaultJobSlug={job.slug}
      />
    </main>
  );
}
