export default function ApplyLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-10 w-80 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
        <div className="rounded-lg border border-border bg-slate-50 p-4">
          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-10 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
