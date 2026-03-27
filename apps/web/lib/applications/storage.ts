import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type StoreResumeFileInput = {
  email: string;
  jobSlug: string;
  resume: File;
};

function sanitizeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getFileExtension(fileName: string) {
  return path.extname(fileName).toLowerCase() || ".bin";
}

export async function storeResumeFile({
  email,
  jobSlug,
  resume,
}: StoreResumeFileInput) {
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "resumes");
  await mkdir(uploadsDirectory, { recursive: true });

  const fileName = [
    sanitizeSegment(jobSlug),
    sanitizeSegment(email.split("@")[0] ?? "candidate"),
    randomUUID(),
  ].join("-");
  const extension = getFileExtension(resume.name);
  const relativeFilePath = path.join("uploads", "resumes", `${fileName}${extension}`);
  const absoluteFilePath = path.join(process.cwd(), "public", relativeFilePath);
  const fileBuffer = Buffer.from(await resume.arrayBuffer());

  await writeFile(absoluteFilePath, fileBuffer);

  return {
    resumeFileUrl: `/${relativeFilePath.replace(/\\/g, "/")}`,
    absoluteFilePath,
  };
}

export async function deleteStoredResume(absoluteFilePath: string) {
  await unlink(absoluteFilePath).catch(() => undefined);
}

export function resolveStoredResumePath(resumeFileUrl: string) {
  const relativePath = resumeFileUrl.replace(/^\//, "");
  return path.join(process.cwd(), "public", relativePath);
}
