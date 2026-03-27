export function JobsLoadingState() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-7 w-72 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
