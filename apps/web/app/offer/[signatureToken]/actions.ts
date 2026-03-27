"use server";

import { redirect } from "next/navigation";

import { createMockSigningSession } from "../../../lib/offers/signature";

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function startOfferSigningAction(formData: FormData) {
  const signatureToken = getStringValue(formData.get("signatureToken"));
  const result = await createMockSigningSession(signatureToken);

  if (!result.ok) {
    redirect(`/offer/${signatureToken}?error=${encodeURIComponent(result.errorMessage)}`);
  }

  redirect(result.signingUrl);
}
