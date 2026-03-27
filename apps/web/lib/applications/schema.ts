import { z } from "zod";

import {
  allowedResumeExtensions,
  allowedResumeMimeTypes,
  maxResumeFileSizeBytes,
} from "./constants";

export const applicationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(160, "Full name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  linkedinUrl: z
    .string()
    .trim()
    .url("Enter a valid LinkedIn URL.")
    .refine((value) => value.includes("linkedin.com/"), "Use a LinkedIn profile URL."),
  portfolioUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === "" || z.string().url().safeParse(value).success,
      "Enter a valid GitHub or portfolio URL.",
    ),
  jobSlug: z.string().trim().min(1, "Select a role."),
  resume: z
    .instanceof(File, { message: "Upload a resume file." })
    .refine((file) => file.size > 0, "Upload a resume file.")
    .refine(
      (file) => file.size <= maxResumeFileSizeBytes,
      `Resume must be ${Math.floor(maxResumeFileSizeBytes / (1024 * 1024))}MB or smaller.`,
    )
    .refine((file) => {
      const normalizedName = file.name.toLowerCase();
      const hasAllowedExtension = allowedResumeExtensions.some((extension) =>
        normalizedName.endsWith(extension),
      );
      const hasAllowedMimeType = allowedResumeMimeTypes.includes(
        file.type as (typeof allowedResumeMimeTypes)[number],
      );

      return hasAllowedExtension && hasAllowedMimeType;
    }, "Resume must be a PDF or DOCX file."),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
