"use server";

import { redirect } from "next/navigation";

import { confirmSlot } from "../../../lib/interview-scheduling";

type CandidateScheduleActionState = {
  errorMessage?: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function confirmCandidateSlotAction(
  _previousState: CandidateScheduleActionState,
  formData: FormData,
): Promise<CandidateScheduleActionState> {
  const accessToken = getStringValue(formData.get("accessToken"));
  const applicationId = getStringValue(formData.get("applicationId"));
  const slotId = getStringValue(formData.get("slotId"));
  const reservationToken = getStringValue(formData.get(`reservationToken:${slotId}`));
  const lockVersion = Number(getStringValue(formData.get(`lockVersion:${slotId}`)));

  if (!slotId || !reservationToken || Number.isNaN(lockVersion)) {
    return {
      errorMessage: "The selected slot could not be confirmed. Please refresh and try again.",
    };
  }

  const result = await confirmSlot({
    applicationId,
    slotId,
    reservationToken,
    lockVersion,
    interviewType: "candidate_selection",
  });

  if (!result.ok) {
    return {
      errorMessage: result.error,
    };
  }

  redirect(`/schedule/${accessToken}/confirmed?slotId=${encodeURIComponent(slotId)}`);
}
