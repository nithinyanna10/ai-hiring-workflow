import { getAdminDashboardMetrics } from "../../../lib/admin/dashboard-metrics";

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  const cards = [
    {
      label: "Active roles",
      value: metrics.activeRoles,
      hint: "Jobs with status OPEN",
    },
    {
      label: "Candidates in pipeline",
      value: metrics.candidatesInPipeline,
      hint: "Applications not rejected, withdrawn, hired, or onboarded",
    },
    {
      label: "Interviews pending",
      value: metrics.interviewsPending,
      hint: "Scheduled interviews without a completed time",
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-600">
          Live counts from the database. Add richer AI and workflow metrics here as you extend the
          product.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((metric) => (
          <section key={metric.label} className="rounded-lg border border-border bg-white p-5">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{metric.hint}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
