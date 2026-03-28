import path from "node:path";
import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

import { resolveStoredResumePath } from "../applications/storage";
import type { ExtractorContext, ResumeFileReference } from "./types";

export async function resolveResumeFileReference(reference: ResumeFileReference) {
  const absoluteFilePath = resolveStoredResumePath(reference.resumeFileUrl);
  await access(absoluteFilePath, fsConstants.R_OK);

  const ext = path.extname(absoluteFilePath).toLowerCase();
  if (ext !== ".pdf" && ext !== ".docx") {
    throw new Error(`Unsupported resume file type: ${ext || "unknown"}`);
  }

  const extension = ext as ExtractorContext["extension"];

  return {
    absoluteFilePath,
    extension,
  };
}
