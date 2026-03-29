import { getAdminDashboardMetrics } from "../../../lib/admin/dashboard-metrics";

export default async function AdminDashboardPage() {
  const m = await getAdminDashboardMetrics();

  const cards = [
    { label: "Open roles", value: m.activeRoles, hint: "Jobs with status OPEN" },
    { label: "Applied today", value: m.appliedToday, hint: "Submitted since midnight (local)" },
    { label: "Screened today", value: m.screenedToday, hint: "AI score set today" },
    { label: "Needs recruiter review", value: m.needsRecruiterReview, hint: "SCREENED / UNDER_REVIEW / PHONE_SCREEN" },
    { label: "Shortlisted", value: m.shortlisted, hint: "Current SHORTLISTED" },
    { label: "In pipeline", value: m.candidatesInPipeline, hint: "Active applications" },
    { label: "Interviews pending", value: m.interviewsPending, hint: "Interviews without completedAt" },
    { label: "Offers awaiting signature", value: m.offerSent, hint: "OFFER_SENT — alert email if ADMIN_ALERT_EMAIL set" },
    { label: "Offers in progress", value: m.offersInProgress, hint: "Draft + sent + signed" },
  ];

  const { funnel } = m;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-600">
          Live database counts. Screening uses score + confidence routing; funnel shows where candidates sit globally.
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pipeline funnel (all applications)
        </h2>
        <div className="mt-4 flex flex-wrap gap-6">
          {[
            { label: "Total applied", value: funnel.totalApplications },
            { label: "Screened (scored)", value: funnel.screenedEver },
            { label: "Shortlisted", value: funnel.shortlistedEver },
            { label: "Interview stage", value: funnel.interviewStage },
            { label: "Offer stage", value: funnel.offerStage },
          ].map((row) => (
            <div key={row.label} className="min-w-[120px]">
              <p className="text-2xl font-bold tabular-nums text-slate-900">{row.value}</p>
              <p className="text-xs font-medium text-slate-500">{row.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
