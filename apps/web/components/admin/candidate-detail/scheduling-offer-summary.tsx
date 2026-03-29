import Link from "next/link";

import type { AdminCandidateDetail } from "../../../types";

function slotLine(slot: AdminCandidateDetail["schedulingSlots"][0]) {
  const start = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(slot.startTime);
  const hold = slot.holdExpiresAt
    ? ` — ${slot.slotStatus} (hold until ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(slot.holdExpiresAt)})`
    : ` — ${slot.slotStatus}`;
  return `${start}${hold}`;
}

export function SchedulingOfferSummary({
  applicationId,
  detail,
}: {
  applicationId: string;
  detail: AdminCandidateDetail;
}) {
  const slots = detail.schedulingSlots;
  const awaiting =
    slots.length > 0 &&
    !slots.some((s) => s.slotStatus === "CONFIRMED" || s.slotStatus === "BOOKED");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Interview slots</h3>
        {slots.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No slots generated yet. Use{" "}
            <Link href={`/admin/candidates/${applicationId}/schedule`} className="font-medium text-blue-700 underline">
              Scheduling
            </Link>{" "}
            to offer times (tokenized candidate link).
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {slots.map((s, i) => (
                <li key={`${s.startTime.toISOString()}-${i}`} className="font-mono text-xs leading-relaxed">
                  {slotLine(s)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-medium text-slate-600">
              Status:{" "}
              {awaiting ? "→ Awaiting candidate selection" : "Slots offered — check scheduling page for details"}
            </p>
          </>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Offer draft</h3>
        {!detail.offerPreview ? (
          <p className="mt-2 text-sm text-slate-600">
            No offer record yet.{" "}
            <Link href={`/admin/candidates/${applicationId}/offer`} className="font-medium text-blue-700 underline">
              Generate offer draft
            </Link>
            .
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-slate-500">
              Last updated:{" "}
              {detail.offerPreview.updatedAt
                ? new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(detail.offerPreview.updatedAt)
                : "—"}
              {" · "}
              Signature: {detail.offerPreview.signatureStatus ?? "—"}
            </p>
            {detail.offerPreview.excerpt ? (
              <div className="max-h-40 overflow-y-auto rounded border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {detail.offerPreview.excerpt}
              </div>
            ) : (
              <p className="text-sm text-amber-800">Draft exists — open offer page for full text.</p>
            )}
            <Link
              href={`/admin/candidates/${applicationId}/offer`}
              className="inline-block text-sm font-medium text-blue-700 underline"
            >
              Open full offer & signing →
            </Link>
            {detail.offerPreview.signatureStatus === "DRAFT" ? (
              <p className="text-xs text-slate-600">Ready for signature when you send the candidate link.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
