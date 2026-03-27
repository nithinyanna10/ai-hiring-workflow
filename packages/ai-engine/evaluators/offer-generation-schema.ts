import { z } from "zod";

export const offerDraftSchema = z.object({
  offerText: z.string().trim().min(1),
});

export type OfferDraftResult = z.infer<typeof offerDraftSchema>;

export const offerDraftJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["offerText"],
  properties: {
    offerText: {
      type: "string",
    },
  },
} satisfies Record<string, unknown>;

export function normalizeOfferDraft(input: OfferDraftResult): OfferDraftResult {
  return {
    offerText: input.offerText.trim(),
  };
}
