"use server";

import { revalidatePath } from "next/cache";

import { createHeldSlots } from "../../../../../lib/interview-scheduling";
import { ensureSchedulingAccessToken } from "../../../../../lib/interview-scheduling/queries";

type SchedulingActionState = {
  errorMessage?: string;
  successMessage?: string;
};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function parseDateTimeLocal(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function generateSlotOffersAction(
  _previousState: SchedulingActionState,
  formData: FormData,
): Promise<SchedulingActionState> {
  const applicationId = getStringValue(formData.get("applicationId"));
  const holdExpiresAtInput = getStringValue(formData.get("holdExpiresAt"));

  const holdExpiresAt = parseDateTimeLocal(holdExpiresAtInput);
  if (!holdExpiresAt) {
    return {
      errorMessage: "Provide a valid hold expiration date and time.",
    };
  }

  const slotStarts = [1, 2, 3, 4, 5]
    .map((index) => parseDateTimeLocal(getStringValue(formData.get(`slotStart${index}`))))
    .filter((value): value is Date => value instanceof Date);

  const result = await createHeldSlots({
    applicationId,
    slotStarts: slotStarts.map((startTime) => ({ startTime })),
    holdExpiresAt,
  });

  if (!result.ok) {
    return {
      errorMessage: result.error,
    };
  }

  await ensureSchedulingAccessToken(applicationId);

  revalidatePath(`/admin/candidates/${applicationId}/schedule`);
  revalidatePath(`/admin/candidates/${applicationId}`);

  return {
    successMessage: "Interview slot offers generated.",
  };
}
