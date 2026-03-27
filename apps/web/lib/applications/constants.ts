export const allowedResumeMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const allowedResumeExtensions = [".pdf", ".docx"] as const;

export const maxResumeFileSizeBytes = 5 * 1024 * 1024;
