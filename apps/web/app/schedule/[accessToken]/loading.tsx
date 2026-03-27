export default function CandidateSchedulingLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-10 w-72 rounded bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-200" />
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          {[0, 1, 2].map((row) => (
            <div key={row} className="mb-4 h-20 rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
