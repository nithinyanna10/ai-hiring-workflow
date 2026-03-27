export default function AdminCandidatesLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-10 w-56 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-200" />
        </div>
        <div className="grid gap-4 rounded-lg border border-border bg-white p-5 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-10 w-full rounded bg-slate-200" />
            </div>
          ))}
          <div className="md:col-span-4">
            <div className="h-10 w-32 rounded bg-slate-200" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="grid grid-cols-5 gap-4">
                {[0, 1, 2, 3, 4].map((cell) => (
                  <div key={cell} className="h-6 rounded bg-slate-200" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
