"use server";

import { revalidatePath } from "next/cache";

import {
  applyAdminStatusOverride,
  type AdminOverrideState,
} from "../../../../lib/admin/candidate-detail";
import { sendRecruiterEmailToCandidate } from "../../../../lib/admin/recruiter-candidate-email";
import type {
  MockNotetakerFormState,
} from "../../../../components/admin/candidate-detail/interview-notes-panel";
import { attachMockNotetakerToLatestInterview } from "../../../../lib/interview/attach-mock-notetaker";
import { completeSlackOnboardingWelcome } from "../../../../lib/onboarding/complete-slack-welcome";
import type { RecruiterEmailFormState } from "../../../../components/admin/candidate-detail/recruiter-email-form";
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

export async function sendRecruiterEmailAction(
  _previousState: RecruiterEmailFormState,
  formData: FormData,
): Promise<RecruiterEmailFormState> {
  const applicationId = getStringValue(formData.get("applicationId"));
  const subject = getStringValue(formData.get("subject"));
  const body = getStringValue(formData.get("body"));

  const result = await sendRecruiterEmailToCandidate({
    applicationId,
    subject,
    body,
  });

  revalidatePath(`/admin/candidates/${applicationId}`);
  revalidatePath("/admin/candidates");

  if (!result.ok) {
    return { errorMessage: result.errorMessage };
  }

  return { successMessage: "Email sent to the candidate." };
}

export async function simulateMockNotetakerAction(
  _previousState: MockNotetakerFormState,
  formData: FormData,
): Promise<MockNotetakerFormState> {
  const applicationId = getStringValue(formData.get("applicationId"));

  const result = await attachMockNotetakerToLatestInterview(applicationId);

  revalidatePath(`/admin/candidates/${applicationId}`);
  revalidatePath("/admin/candidates");

  if (!result.ok) {
    return { errorMessage: result.error };
  }

  return { successMessage: "Mock transcript and summary attached to the latest interview." };
}
