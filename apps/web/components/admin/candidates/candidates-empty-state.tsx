export function CandidatesEmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold tracking-tight">No applications found</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        No applications match the current filters. Adjust the filters or check back after new
        submissions arrive.
      </p>
    </section>
  );
}
