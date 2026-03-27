import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          AI Hiring Workflow
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Minimal monorepo scaffold for a hiring application.
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Public application flows, admin operations, API routes, shared schemas,
          AI modules, and workflow orchestration are organized for incremental
          implementation.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link className="rounded border border-slate-300 px-4 py-2 no-underline" href="/careers">
          View careers
        </Link>
        <Link
          className="rounded border border-slate-300 px-4 py-2 no-underline"
          href="/admin/dashboard"
        >
          Admin dashboard
        </Link>
      </div>
    </main>
  );
}
