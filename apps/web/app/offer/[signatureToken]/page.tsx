import Link from "next/link";
import { notFound } from "next/navigation";

import { getOfferReviewDetail } from "../../../lib/offers/signature";
import { startOfferSigningAction } from "./actions";
import type { PageSearchParams, RouteParams } from "../../../types";

function formatCurrency(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OfferReviewPage({
  params,
  searchParams,
}: RouteParams<{ signatureToken: string }> & PageSearchParams<{ error?: string }>) {
  const { signatureToken } = await params;
  const query = await searchParams;
  const detail = await getOfferReviewDetail(signatureToken);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Offer Review
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{detail.roleTitle}</h1>
          <p className="text-sm leading-6 text-slate-600">
            {detail.candidateName}, review your offer details below and complete the signature
            flow when ready.
          </p>
        </header>

        {query?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {query.error}
          </div>
        ) : null}

        <section className="grid gap-4 rounded-lg border border-border bg-white p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Start date</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {detail.startDate ? new Date(detail.startDate).toLocaleDateString() : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Manager</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {detail.managerName ?? "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Base salary</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatCurrency(detail.baseSalary)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Bonus / equity</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {[detail.bonus ? `Bonus ${formatCurrency(detail.bonus)}` : null, detail.equity ? `Equity ${detail.equity}` : null]
                .filter(Boolean)
                .join(" · ") || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-slate-500">Signature status</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {detail.signatureStatus}
              {detail.signedAt ? ` on ${new Date(detail.signedAt).toLocaleString()}` : ""}
            </p>
          </div>
        </section>

        {detail.customTerms ? (
          <section className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-lg font-semibold tracking-tight">Custom terms</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {detail.customTerms}
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-lg font-semibold tracking-tight">Offer letter</h2>
          <div className="mt-4 whitespace-pre-wrap rounded bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {detail.offerText ?? "Offer text is not available yet."}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {detail.signatureStatus === "SIGNED" ? (
            <Link
              href={`/offer/${signatureToken}/signed`}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              View signed confirmation
            </Link>
          ) : (
            <form action={startOfferSigningAction}>
              <input type="hidden" name="signatureToken" value={signatureToken} />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Sign offer
              </button>
            </form>
          )}
          <p className="text-sm text-slate-500">
            This mock flow simulates a provider-hosted signing callback path.
          </p>
        </div>
      </div>
    </main>
  );
}
