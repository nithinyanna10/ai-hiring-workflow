import { JobCard } from "../../../components/public/job-card";
import { JobsEmptyState } from "../../../components/public/jobs-empty-state";
import { getOpenJobs } from "../../../lib/db";

export const revalidate = 60;

export default async function CareersPage() {
  const jobs = await getOpenJobs();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="mb-10 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Careers
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Open roles</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Explore active opportunities across product, engineering, and operations.
        </p>
      </div>

      {jobs.length === 0 ? (
        <JobsEmptyState />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}
