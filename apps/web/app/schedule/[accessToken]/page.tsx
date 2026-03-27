import { SlotStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { CandidateSlotPicker } from "../../../components/interview-scheduling/candidate-slot-picker";
import { getCandidateSchedulingDetail } from "../../../lib/interview-scheduling/queries";
import { confirmCandidateSlotAction } from "./actions";
import type { RouteParams } from "../../../types";

export const dynamic = "force-dynamic";

function getAvailabilityMessage(
  slots: Array<{ slotStatus: SlotStatus }>,
  currentStatus: string,
) {
  if (currentStatus === "INTERVIEW_SCHEDULED") {
    return "An interview has already been scheduled for this application.";
  }

  if (slots.some((slot) => slot.slotStatus === SlotStatus.EXPIRED)) {
    return "These interview offers have expired. Contact the hiring team for new options.";
  }

  if (slots.some((slot) => slot.slotStatus === SlotStatus.CONFIRMED)) {
    return "This interview slot link has already been used to confirm a slot.";
  }

  return "There are no available interview slots at this time.";
}

export default async function CandidateSchedulingPage({
  params,
}: RouteParams<{ accessToken: string }>) {
  const { accessToken } = await params;
  const detail = await getCandidateSchedulingDetail(accessToken);

  if (!detail) {
    notFound();
  }

  const availableSlots = detail.interviewSlots.filter(
    (slot) => slot.slotStatus === SlotStatus.HELD && slot.reservationToken,
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Interview Scheduling
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Select an interview slot
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            {detail.job.title} · {detail.job.team} for {detail.candidate.firstName}{" "}
            {detail.candidate.lastName}
          </p>
        </div>

        {availableSlots.length > 0 ? (
          <CandidateSlotPicker
            accessToken={accessToken}
            applicationId={detail.id}
            slots={detail.interviewSlots.map((slot) => ({
              ...slot,
              startTime: slot.startTime.toISOString(),
              endTime: slot.endTime.toISOString(),
              holdExpiresAt: slot.holdExpiresAt ? slot.holdExpiresAt.toISOString() : null,
            }))}
            action={confirmCandidateSlotAction}
          />
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold tracking-tight">Slot unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {getAvailabilityMessage(detail.interviewSlots, detail.currentStatus)}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
