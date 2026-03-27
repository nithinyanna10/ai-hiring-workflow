"use server";

import { redirect } from "next/navigation";

import { applicationFormSchema } from "../../../../lib/applications/schema";
import { maxResumeFileSizeBytes } from "../../../../lib/applications/constants";
import { submitApplication } from "../../../../lib/applications/submit-application";
import type { ApplicationActionState } from "../../../../lib/applications/types";

const defaultApplicationState: ApplicationActionState = {};

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function submitApplicationAction(
  _routeJobSlug: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const resume = formData.get("resume");
  const parsed = applicationFormSchema.safeParse({
    fullName: getStringValue(formData.get("fullName")),
    email: getStringValue(formData.get("email")),
    linkedinUrl: getStringValue(formData.get("linkedinUrl")),
    portfolioUrl: getStringValue(formData.get("portfolioUrl")),
    jobSlug: getStringValue(formData.get("jobSlug")),
    resume: resume instanceof File ? resume : new File([], ""),
  });

  if (!parsed.success) {
    const flattenedErrors = parsed.error.flatten();
    const resumeFile = resume instanceof File ? resume : null;

    let errorCode: ApplicationActionState["errorCode"] = "VALIDATION_ERROR";
    let errorMessage = "Please correct the highlighted fields and try again.";

    if (resumeFile && resumeFile.size > maxResumeFileSizeBytes) {
      errorCode = "OVERSIZED_FILE";
      errorMessage = "Resume file is too large. Upload a file smaller than 5MB.";
    } else if (flattenedErrors.fieldErrors.resume?.some((message) => message.includes("PDF or DOCX"))) {
      errorCode = "INVALID_FILE_TYPE";
      errorMessage = "Resume must be uploaded as a PDF or DOCX file.";
    }

    return {
      errorCode,
      errorMessage,
      fieldErrors: flattenedErrors.fieldErrors,
    };
  }

  try {
    const result = await submitApplication(parsed.data);

    if (!result.ok) {
      return {
        errorCode: result.code,
        errorMessage: result.message,
      };
    }
  } catch {
    return {
      errorCode: "UNKNOWN_ERROR",
      errorMessage: "Something went wrong while submitting your application.",
    };
  }

  redirect(
    `/apply/${parsed.data.jobSlug}/success?email=${encodeURIComponent(parsed.data.email.trim())}`,
  );
}

export { defaultApplicationState };
