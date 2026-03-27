import { z } from "zod";

export const screeningConfidenceValues = ["low", "medium", "high"] as const;
export const screeningRecommendationValues = [
  "strong_yes",
  "yes",
  "maybe",
  "no",
] as const;

export const screeningResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  confidenceLevel: z.enum(screeningConfidenceValues),
  strengths: z.array(z.string().trim().min(1)),
  gaps: z.array(z.string().trim().min(1)),
  recommendation: z.enum(screeningRecommendationValues),
  rationale: z.string().trim().min(1),
});

export type ScreeningResult = z.infer<typeof screeningResultSchema>;

export const screeningResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "score",
    "confidenceLevel",
    "strengths",
    "gaps",
    "recommendation",
    "rationale",
  ],
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    confidenceLevel: {
      type: "string",
      enum: screeningConfidenceValues,
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    gaps: {
      type: "array",
      items: { type: "string" },
    },
    recommendation: {
      type: "string",
      enum: screeningRecommendationValues,
    },
    rationale: {
      type: "string",
    },
  },
} satisfies Record<string, unknown>;

export function normalizeScreeningResult(input: ScreeningResult): ScreeningResult {
  const normalizeList = (values: string[]) =>
    [...new Set(values.map((value) => value.trim()).filter(Boolean))];

  return {
    score: Math.max(0, Math.min(100, Math.round(input.score))),
    confidenceLevel: input.confidenceLevel,
    strengths: normalizeList(input.strengths),
    gaps: normalizeList(input.gaps),
    recommendation: input.recommendation,
    rationale: input.rationale.trim(),
  };
}
