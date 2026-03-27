import { SlotStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCandidateSchedulingDetail } from "../../../../lib/interview-scheduling/queries";
import type { PageSearchParams, RouteParams } from "../../../../types";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function CandidateSchedulingConfirmedPage({
  params,
  searchParams,
}: RouteParams<{ accessToken: string }> & PageSearchParams<{ slotId?: string }>) {
  const { accessToken } = await params;
  const { slotId } = await searchParams;
  const detail = await getCandidateSchedulingDetail(accessToken);

  if (!detail) {
    notFound();
  }

  const confirmedSlot =
    detail.interviewSlots.find((slot) => slot.id === slotId && slot.slotStatus === SlotStatus.CONFIRMED) ??
    detail.interviewSlots.find((slot) => slot.slotStatus === SlotStatus.CONFIRMED);

  if (!confirmedSlot) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Confirmation unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A confirmed interview slot could not be found for this scheduling link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-border bg-white p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Interview confirmed
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Your interview has been scheduled.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {detail.job.title} · {detail.job.team}
        </p>
        <div className="mt-6 rounded bg-slate-50 p-4 text-sm text-slate-700">
          {formatDateTime(confirmedSlot.startTime)} to {formatDateTime(confirmedSlot.endTime)}
        </div>
        <div className="mt-6">
          <Link href="/" className="rounded border border-slate-300 px-4 py-2 text-sm no-underline">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
