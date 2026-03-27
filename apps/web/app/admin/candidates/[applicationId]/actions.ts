"use server";

import { revalidatePath } from "next/cache";

import {
  applyAdminStatusOverride,
  type AdminOverrideState,
} from "../../../../lib/admin/candidate-detail";

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function applyAdminOverrideAction(
  _previousState: AdminOverrideState,
  formData: FormData,
): Promise<AdminOverrideState> {
  const applicationId = getStringValue(formData.get("applicationId"));
  const targetStatus = getStringValue(formData.get("targetStatus"));
  const note = getStringValue(formData.get("note"));

  const result = await applyAdminStatusOverride({
    applicationId,
    targetStatus: targetStatus as "SHORTLISTED" | "REJECTED",
    note,
  });

  revalidatePath(`/admin/candidates/${applicationId}`);
  revalidatePath("/admin/candidates");

  if (!result.ok) {
    return {
      errorMessage: result.errorMessage,
    };
  }

  return {
    successMessage: result.successMessage,
  };
}
