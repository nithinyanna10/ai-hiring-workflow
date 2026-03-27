import Link from "next/link";
import { notFound } from "next/navigation";

import { getOfferReviewDetail } from "../../../../lib/offers/signature";
import type { RouteParams } from "../../../../types";

export default async function OfferSignedPage({
  params,
}: RouteParams<{ signatureToken: string }>) {
  const { signatureToken } = await params;
  const detail = await getOfferReviewDetail(signatureToken);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <div className="rounded-lg border border-border bg-white p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Offer Signed
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Signature received</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your signed acceptance for the {detail.roleTitle} offer has been recorded.
        </p>
        <p className="mt-4 text-sm text-slate-700">
          Signed at: {detail.signedAt ? new Date(detail.signedAt).toLocaleString() : "Pending"}
        </p>
        <Link
          href={`/offer/${signatureToken}`}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700"
        >
          View offer
        </Link>
      </div>
    </main>
  );
}
