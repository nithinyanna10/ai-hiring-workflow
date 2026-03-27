import Link from "next/link";

export function JobsEmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold tracking-tight">No open roles right now</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        There are no active openings published yet. Check back later for new roles.
      </p>
      <div className="mt-5">
        <Link href="/" className="rounded border border-slate-300 px-4 py-2 text-sm no-underline">
          Return home
        </Link>
      </div>
    </section>
  );
}
