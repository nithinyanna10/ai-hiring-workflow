import { z } from "zod";

export const inferredSeniorityValues = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
  "executive",
  "unknown",
] as const;

export const structuredResumeSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().email().nullable(),
  phone: z.string().trim().min(1).nullable(),
  skills: z.array(z.string().trim().min(1)),
  yearsExperience: z.number().min(0).max(60).nullable(),
  education: z.array(z.string().trim().min(1)),
  companies: z.array(z.string().trim().min(1)),
  jobTitles: z.array(z.string().trim().min(1)),
  achievements: z.array(z.string().trim().min(1)),
  certifications: z.array(z.string().trim().min(1)),
  projectHighlights: z.array(z.string().trim().min(1)),
  inferredSeniority: z.enum(inferredSeniorityValues),
});

export type StructuredResume = z.infer<typeof structuredResumeSchema>;

export const structuredResumeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "fullName",
    "email",
    "phone",
    "skills",
    "yearsExperience",
    "education",
    "companies",
    "jobTitles",
    "achievements",
    "certifications",
    "projectHighlights",
    "inferredSeniority",
  ],
  properties: {
    fullName: { type: "string" },
    email: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    phone: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    skills: {
      type: "array",
      items: { type: "string" },
    },
    yearsExperience: {
      anyOf: [{ type: "number" }, { type: "null" }],
    },
    education: {
      type: "array",
      items: { type: "string" },
    },
    companies: {
      type: "array",
      items: { type: "string" },
    },
    jobTitles: {
      type: "array",
      items: { type: "string" },
    },
    achievements: {
      type: "array",
      items: { type: "string" },
    },
    certifications: {
      type: "array",
      items: { type: "string" },
    },
    projectHighlights: {
      type: "array",
      items: { type: "string" },
    },
    inferredSeniority: {
      type: "string",
      enum: inferredSeniorityValues,
    },
  },
} satisfies Record<string, unknown>;

export function normalizeStructuredResume(input: StructuredResume): StructuredResume {
  const uniqueSorted = (values: string[]) =>
    [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

  return {
    fullName: input.fullName.trim(),
    email: input.email?.trim().toLowerCase() ?? null,
    phone: input.phone?.trim() ?? null,
    skills: uniqueSorted(input.skills),
    yearsExperience: input.yearsExperience,
    education: uniqueSorted(input.education),
    companies: uniqueSorted(input.companies),
    jobTitles: uniqueSorted(input.jobTitles),
    achievements: uniqueSorted(input.achievements),
    certifications: uniqueSorted(input.certifications),
    projectHighlights: uniqueSorted(input.projectHighlights),
    inferredSeniority: input.inferredSeniority,
  };
}
