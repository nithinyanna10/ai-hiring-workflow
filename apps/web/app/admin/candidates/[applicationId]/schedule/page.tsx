import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminSlotGenerator } from "../../../../../components/interview-scheduling/admin-slot-generator";
import { SlotTable } from "../../../../../components/interview-scheduling/slot-table";
import { generateSlotOffersAction } from "./actions";
import {
  canGenerateSchedulingOffers,
  ensureSchedulingAccessToken,
  getAdminSchedulingDetail,
} from "../../../../../lib/interview-scheduling/queries";
import { env } from "../../../../../lib/env";
import type { RouteParams } from "../../../../../types";

export const dynamic = "force-dynamic";

export default async function AdminCandidateSchedulingPage({
  params,
}: RouteParams<{ applicationId: string }>) {
  const { applicationId } = await params;
  const detail = await getAdminSchedulingDetail(applicationId);

  if (!detail) {
    notFound();
  }

  const accessToken = await ensureSchedulingAccessToken(applicationId);
  const candidateLink = `${env.NEXT_PUBLIC_APP_URL}/schedule/${accessToken}`;
  const canGenerate = canGenerateSchedulingOffers(detail.currentStatus);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href={`/admin/candidates/${applicationId}`} className="text-sm text-slate-500">
            Back to candidate detail
          </Link>
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Interview Scheduling
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {detail.candidate.firstName} {detail.candidate.lastName}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {detail.job.title} · {detail.job.team} · {detail.candidate.email}
            </p>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-white p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Candidate scheduling link</h2>
            <p className="text-sm leading-6 text-slate-600">
              Share this secure link with the candidate so they can choose one offered slot.
            </p>
          </div>
          <div className="mt-4 rounded bg-slate-50 p-4 text-sm text-slate-700 break-all">
            {candidateLink}
          </div>
        </section>

        {canGenerate ? (
          <AdminSlotGenerator
            applicationId={applicationId}
            action={generateSlotOffersAction}
          />
        ) : (
          <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            Slot offers can be generated only for shortlisted or already scheduled applications.
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Offered slots</h2>
          <SlotTable slots={detail.interviewSlots} />
        </section>
      </div>
    </main>
  );
}
