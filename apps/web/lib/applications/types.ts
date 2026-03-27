export type ApplicationFieldErrors = Partial<
  Record<
    "fullName" | "email" | "linkedinUrl" | "portfolioUrl" | "jobSlug" | "resume",
    string[]
  >
>;

export type ApplicationActionState = {
  errorCode?:
    | "INVALID_FILE_TYPE"
    | "OVERSIZED_FILE"
    | "DUPLICATE_APPLICATION"
    | "ROLE_UNAVAILABLE"
    | "VALIDATION_ERROR"
    | "UNKNOWN_ERROR";
  errorMessage?: string;
  fieldErrors?: ApplicationFieldErrors;
};
