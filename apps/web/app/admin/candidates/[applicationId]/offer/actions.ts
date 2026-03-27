"use server";

import { revalidatePath } from "next/cache";

import { generateAndStoreOffer } from "../../../../../lib/offers/service";

type OfferActionState = {
  errorMessage?: string;
  successMessage?: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function generateOfferDraftAction(
  _previousState: OfferActionState,
  formData: FormData,
): Promise<OfferActionState> {
  const applicationId = getStringValue(formData.get("applicationId"));

  const result = await generateAndStoreOffer({
    applicationId,
    title: getStringValue(formData.get("title")),
    startDate: getStringValue(formData.get("startDate")),
    baseSalary: getStringValue(formData.get("baseSalary")),
    equity: getStringValue(formData.get("equity")),
    bonus: getStringValue(formData.get("bonus")),
    managerName: getStringValue(formData.get("managerName")),
    customTerms: getStringValue(formData.get("customTerms")),
  });

  revalidatePath(`/admin/candidates/${applicationId}/offer`);
  revalidatePath(`/admin/candidates/${applicationId}`);

  if (!result.ok) {
    return {
      errorMessage: result.errorMessage,
    };
  }

  return {
    successMessage: result.successMessage,
  };
}
