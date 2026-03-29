import Link from "next/link";
import { notFound } from "next/navigation";

import { OfferForm } from "../../../../../components/admin/offer/offer-form";
import {
  ensureOfferSignatureToken,
  getOfferFormDetail,
} from "../../../../../lib/offers/service";
import { generateOfferDraftAction } from "./actions";
import type { RouteParams } from "../../../../../types";

function formatDecimal(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : "";
}

export default async function AdminOfferPage({
  params,
}: RouteParams<{ applicationId: string }>) {
  const { applicationId } = await params;
  const detail = await getOfferFormDetail(applicationId);

  if (!detail) {
    notFound();
  }

  const signatureToken = detail.offer ? await ensureOfferSignatureToken(applicationId) : null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href={`/admin/candidates/${applicationId}`} className="text-sm text-slate-500">
            Back to candidate detail
          </Link>
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Offer Generation
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {detail.candidate.firstName} {detail.candidate.lastName}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {detail.job.title} · {detail.job.team}
            </p>
          </div>
        </div>

        <OfferForm
          applicationId={applicationId}
          defaultValues={{
            title: detail.offer?.title ?? detail.job.title,
            startDate: detail.offer?.startDate
              ? new Date(detail.offer.startDate).toISOString().slice(0, 10)
              : "",
            baseSalary: formatDecimal(detail.offer?.baseSalary),
            equity: formatDecimal(detail.offer?.equity),
            bonus: formatDecimal(detail.offer?.bonus),
            managerName: detail.offer?.managerName ?? "",
            customTerms: detail.offer?.customTerms ?? "",
          }}
          action={generateOfferDraftAction}
        />

        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight">Draft preview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The stored draft below is suitable for later PDF generation or signature workflow
            integration.
          </p>

          <div className="mt-4 whitespace-pre-wrap rounded bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {detail.offer?.offerText ?? "No offer draft has been generated yet."}
          </div>

          <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Last generated / updated</dt>
              <dd className="font-medium text-slate-800">
                {detail.offer?.updatedAt
                  ? new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(detail.offer.updatedAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Signature status</dt>
              <dd className="font-medium text-slate-800">
                {detail.offer?.signatureStatus ?? "—"}
              </dd>
            </div>
          </dl>

          {signatureToken ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">Candidate signing link</p>
              <Link
                href={`/offer/${signatureToken}`}
                className="mt-2 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700"
              >
                Open candidate offer page
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
