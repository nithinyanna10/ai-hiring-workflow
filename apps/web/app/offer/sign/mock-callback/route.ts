import { NextResponse } from "next/server";

import { completeOfferSignature } from "../../../../lib/offers/signature";

function getSignerIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const signatureToken = url.searchParams.get("signatureToken");

  if (!signatureToken) {
    return NextResponse.redirect(new URL("/", url));
  }

  const result = await completeOfferSignature(signatureToken, getSignerIp(request));

  if (!result.ok) {
    const reviewUrl = new URL(`/offer/${signatureToken}`, url);
    reviewUrl.searchParams.set("error", result.errorMessage);
    return NextResponse.redirect(reviewUrl);
  }

  return NextResponse.redirect(new URL(`/offer/${signatureToken}/signed`, url));
}
