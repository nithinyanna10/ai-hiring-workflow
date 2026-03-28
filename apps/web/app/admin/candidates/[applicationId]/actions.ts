"use server";

import { revalidatePath } from "next/cache";

import {
  applyAdminStatusOverride,
  type AdminOverrideState,
} from "../../../../lib/admin/candidate-detail";
import { completeSlackOnboardingWelcome } from "../../../../lib/onboarding/complete-slack-welcome";
import type { SlackOnboardingSimulateState } from "../../../../components/admin/candidate-detail/slack-onboarding-form";

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

export async function simulateSlackJoinOnboardingAction(
  _previousState: SlackOnboardingSimulateState,
  formData: FormData,
): Promise<SlackOnboardingSimulateState> {
  const applicationId = getStringValue(formData.get("applicationId"));

  if (!applicationId) {
    return { errorMessage: "Missing application id." };
  }

  const result = await completeSlackOnboardingWelcome({
    applicationId,
    simulatedJoin: true,
  });

  revalidatePath(`/admin/candidates/${applicationId}`);
  revalidatePath("/admin/candidates");

  if (!result.ok) {
    return { errorMessage: result.error };
  }

  if (result.phase === "already_onboarded") {
    return { successMessage: "Application is already onboarded (welcome phase was idempotent)." };
  }

  return { successMessage: "Slack welcome, HR notification, and ONBOARDED status completed." };
}
