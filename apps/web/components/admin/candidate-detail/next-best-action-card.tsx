import type { NextBestAction } from "../../../lib/admin/next-best-action";

export function NextBestActionCard({ action }: { action: NextBestAction }) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
        Recommended next step
      </p>
      <p className="mt-2 text-base font-semibold text-violet-950">{action.headline}</p>
      <p className="mt-1 text-sm leading-6 text-violet-900/90">{action.detail}</p>
    </div>
  );
}
