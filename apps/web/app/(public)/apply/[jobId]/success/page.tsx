import Link from "next/link";

import { getJobBySlug } from "../../../../../lib/db";
import type { PageSearchParams, RouteParams } from "../../../../../types";

export default async function ApplicationSuccessPage({
  params,
  searchParams,
}: RouteParams<{ jobId: string }> &
  PageSearchParams<{ email?: string }>) {
  const { jobId } = await params;
  const { email } = await searchParams;
  const job = await getJobBySlug(jobId);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-border bg-white p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Application received
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Thanks for applying{job ? ` to ${job.title}` : ""}.
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Your submission has been recorded and the hiring team will review it.{" "}
            {typeof email === "string" ? `We will contact ${email} if there is a fit.` : null}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/careers" className="rounded border border-slate-300 px-4 py-2 text-sm no-underline">
            Back to careers
          </Link>
          {job ? (
            <Link
              href={`/careers/${job.slug}`}
              className="rounded border border-slate-300 px-4 py-2 text-sm no-underline"
            >
              View job details
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
