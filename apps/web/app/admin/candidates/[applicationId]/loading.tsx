export default function AdminCandidateDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-10 w-72 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-200" />
        </div>
        <div className="grid gap-4 rounded-lg border border-border bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-5 w-full rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            {[0, 1, 2].map((section) => (
              <div key={section} className="rounded-lg border border-border bg-white p-6">
                <div className="space-y-3">
                  <div className="h-6 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="space-y-3">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="h-24 w-full rounded bg-slate-200" />
              <div className="h-10 w-40 rounded bg-slate-200" />
              <div className="h-10 w-40 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
