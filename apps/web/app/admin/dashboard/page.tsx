export default function AdminDashboardPage() {
  const metrics = [
    { label: "Active roles", value: "4" },
    { label: "Candidates in review", value: "18" },
    { label: "Interviews pending", value: "6" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-600">
          Workflow and AI metrics will surface here as backend services are added.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <section key={metric.label} className="rounded-lg border border-border bg-white p-5">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
