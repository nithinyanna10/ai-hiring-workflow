import { z } from "zod";

export const candidateResearchSchema = z.object({
  shortCandidateBrief: z.string().trim().min(1),
  likelyStrengths: z.array(z.string().trim().min(1)),
  notablePublicProjects: z.array(z.string().trim().min(1)),
  discrepancyFlags: z.array(z.string().trim().min(1)),
  interviewerPrepNotes: z.array(z.string().trim().min(1)),
});

export type CandidateResearchResult = z.infer<typeof candidateResearchSchema>;

export const candidateResearchJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "shortCandidateBrief",
    "likelyStrengths",
    "notablePublicProjects",
    "discrepancyFlags",
    "interviewerPrepNotes",
  ],
  properties: {
    shortCandidateBrief: { type: "string" },
    likelyStrengths: {
      type: "array",
      items: { type: "string" },
    },
    notablePublicProjects: {
      type: "array",
      items: { type: "string" },
    },
    discrepancyFlags: {
      type: "array",
      items: { type: "string" },
    },
    interviewerPrepNotes: {
      type: "array",
      items: { type: "string" },
    },
  },
} satisfies Record<string, unknown>;

export function normalizeCandidateResearch(
  input: CandidateResearchResult,
): CandidateResearchResult {
  const normalizeList = (values: string[]) =>
    [...new Set(values.map((value) => value.trim()).filter(Boolean))];

  return {
    shortCandidateBrief: input.shortCandidateBrief.trim(),
    likelyStrengths: normalizeList(input.likelyStrengths),
    notablePublicProjects: normalizeList(input.notablePublicProjects),
    discrepancyFlags: normalizeList(input.discrepancyFlags),
    interviewerPrepNotes: normalizeList(input.interviewerPrepNotes),
  };
}
