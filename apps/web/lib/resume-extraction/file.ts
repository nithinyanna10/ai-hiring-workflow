import path from "node:path";
import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

import { resolveStoredResumePath } from "../applications/storage";
import type { ResumeFileReference } from "./types";

export async function resolveResumeFileReference(reference: ResumeFileReference) {
  const absoluteFilePath = resolveStoredResumePath(reference.resumeFileUrl);
  await access(absoluteFilePath, fsConstants.R_OK);

  const extension = path.extname(absoluteFilePath).toLowerCase();
  if (extension !== ".pdf" && extension !== ".docx") {
    throw new Error(`Unsupported resume file type: ${extension || "unknown"}`);
  }

  return {
    absoluteFilePath,
    extension,
  };
}
