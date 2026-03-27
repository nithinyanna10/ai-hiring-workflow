import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JobBulletList } from "../../../../components/public/job-bullet-list";
import { JobDetailHeader } from "../../../../components/public/job-detail-header";
import { JobsSection } from "../../../../components/public/jobs-section";
import { getOpenJobBySlug } from "../../../../lib/db";
import type { RouteParams } from "../../../../types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: RouteParams<{ jobId: string }>): Promise<Metadata> {
  const { jobId } = await params;
  const job = await getOpenJobBySlug(jobId);

  if (!job) {
    return {
      title: "Role Not Found",
    };
  }

  return {
    title: `${job.title} | Careers`,
    description: job.description,
  };
}

export default async function JobDetailPage({
  params,
}: RouteParams<{ jobId: string }>) {
  const { jobId } = await params;
  const job = await getOpenJobBySlug(jobId);

  if (!job) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="space-y-10">
        <JobDetailHeader job={job} />

        <JobsSection title="Role overview">
          <p className="text-sm leading-7 text-slate-700">{job.description}</p>
        </JobsSection>

        <JobsSection title="Responsibilities">
          <JobBulletList items={job.responsibilities} />
        </JobsSection>

        <JobsSection title="Requirements">
          <JobBulletList items={job.requirements} />
        </JobsSection>
      </div>
    </main>
  );
}
