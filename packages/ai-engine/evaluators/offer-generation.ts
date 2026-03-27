import { StructuredOutputError, type AIProvider } from "../clients/ai-provider";
import {
  buildOfferGenerationRepairPrompt,
  buildOfferGenerationSystemPrompt,
  buildOfferGenerationUserPrompt,
} from "../prompts/offer-generation";
import {
  normalizeOfferDraft,
  offerDraftJsonSchema,
  offerDraftSchema,
  type OfferDraftResult,
} from "./offer-generation-schema";

export type GenerateOfferDraftInput = {
  candidateName: string;
  companyName: string;
  title: string;
  startDate: string;
  baseSalary: string;
  equity?: string | null;
  bonus?: string | null;
  managerName: string;
  customTerms?: string | null;
};

export class OfferGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferGenerationError";
  }
}

function validateOfferDraft(candidate: unknown): OfferDraftResult {
  const parsed = offerDraftSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new OfferGenerationError(parsed.error.message);
  }

  return normalizeOfferDraft(parsed.data);
}

export async function generateOfferDraftWithAI(
  provider: AIProvider,
  input: GenerateOfferDraftInput,
): Promise<OfferDraftResult> {
  const systemPrompt = buildOfferGenerationSystemPrompt();
  const userPrompt = buildOfferGenerationUserPrompt(input);

  try {
    const initialResult = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt,
      schemaName: "offer_letter_draft",
      schemaDescription: "Structured employment offer draft output.",
      jsonSchema: offerDraftJsonSchema,
      temperature: 0,
    });

    return validateOfferDraft(initialResult.parsedJson);
  } catch (error) {
    const malformedOutput =
      error instanceof StructuredOutputError
        ? error.rawText
        : error instanceof OfferGenerationError
          ? "Validation failed for the previous offer generation output."
          : error instanceof Error
            ? error.message
            : "unknown_error";

    try {
      const repairedResult = await provider.generateStructuredObject({
        systemPrompt,
        userPrompt: buildOfferGenerationRepairPrompt({
          ...input,
          malformedOutput,
        }),
        schemaName: "offer_letter_draft_repair",
        schemaDescription: "Repaired employment offer draft output.",
        jsonSchema: offerDraftJsonSchema,
        temperature: 0,
      });

      return validateOfferDraft(repairedResult.parsedJson);
    } catch (repairError) {
      if (repairError instanceof OfferGenerationError) {
        throw repairError;
      }

      throw new OfferGenerationError(
        repairError instanceof Error
          ? repairError.message
          : "Offer generation failed after repair attempt.",
      );
    }
  }
}
