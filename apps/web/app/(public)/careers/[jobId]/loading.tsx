export default function JobDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
          <div className="h-10 w-80 rounded bg-slate-200" />
          <div className="h-10 w-36 rounded bg-slate-200" />
        </div>
        {[0, 1, 2].map((section) => (
          <section key={section} className="rounded-lg border border-border bg-white p-6">
            <div className="space-y-3">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
