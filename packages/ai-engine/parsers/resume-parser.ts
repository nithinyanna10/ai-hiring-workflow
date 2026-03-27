import { StructuredOutputError, type AIProvider } from "../clients/ai-provider";
import {
  buildResumeParsingSystemPrompt,
  buildResumeParsingUserPrompt,
  buildResumeRepairPrompt,
} from "../prompts/resume-parsing";
import {
  normalizeStructuredResume,
  structuredResumeJsonSchema,
  structuredResumeSchema,
  type StructuredResume,
} from "./resume-schema";

export type ParseResumeInput = {
  rawResumeText: string;
};

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

function validateStructuredResume(candidate: unknown): StructuredResume {
  const parsed = structuredResumeSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new ResumeParseError(parsed.error.message);
  }

  return normalizeStructuredResume(parsed.data);
}

export async function parseResumeWithAI(
  provider: AIProvider,
  input: ParseResumeInput,
): Promise<StructuredResume> {
  const systemPrompt = buildResumeParsingSystemPrompt();
  const userPrompt = buildResumeParsingUserPrompt(input.rawResumeText);

  try {
    const initialResult = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt,
      schemaName: "structured_resume",
      schemaDescription: "Structured resume JSON for hiring workflows.",
      jsonSchema: structuredResumeJsonSchema,
      temperature: 0,
    });

    return validateStructuredResume(initialResult.parsedJson);
  } catch (error) {
    const malformedOutput =
      error instanceof StructuredOutputError
        ? error.rawText
        : error instanceof ResumeParseError
          ? "Validation failed for the previous structured output."
          : error instanceof Error
            ? error.message
            : "unknown_error";

    try {
      const repairedResult = await provider.generateStructuredObject({
        systemPrompt,
        userPrompt: buildResumeRepairPrompt(input.rawResumeText, malformedOutput),
        schemaName: "structured_resume_repair",
        schemaDescription: "Repaired structured resume JSON for hiring workflows.",
        jsonSchema: structuredResumeJsonSchema,
        temperature: 0,
      });

      return validateStructuredResume(repairedResult.parsedJson);
    } catch (repairError) {
      if (repairError instanceof ResumeParseError) {
        throw repairError;
      }

      throw new ResumeParseError(
        repairError instanceof Error
          ? repairError.message
          : "Resume parsing failed after repair attempt.",
      );
    }
  }
}
