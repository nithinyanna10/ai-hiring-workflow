import { StructuredOutputError, type AIProvider } from "../clients/ai-provider";
import {
  buildResumeScreeningRepairPrompt,
  buildResumeScreeningSystemPrompt,
  buildResumeScreeningUserPrompt,
} from "../prompts/resume-screening";
import type { StructuredResume } from "../parsers/resume-schema";
import {
  normalizeScreeningResult,
  screeningResultJsonSchema,
  screeningResultSchema,
  type ScreeningResult,
} from "./screening-schema";

export type ScreenResumeInput = {
  parsedResume: StructuredResume;
  jobDescription: string;
};

export class ResumeScreeningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeScreeningError";
  }
}

function validateScreeningResult(candidate: unknown): ScreeningResult {
  const parsed = screeningResultSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new ResumeScreeningError(parsed.error.message);
  }

  return normalizeScreeningResult(parsed.data);
}

export async function screenResumeWithAI(
  provider: AIProvider,
  input: ScreenResumeInput,
): Promise<ScreeningResult> {
  const systemPrompt = buildResumeScreeningSystemPrompt();
  const parsedResumeJson = JSON.stringify(input.parsedResume, null, 2);
  const userPrompt = buildResumeScreeningUserPrompt(parsedResumeJson, input.jobDescription);

  try {
    const initialResult = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt,
      schemaName: "resume_screening_result",
      schemaDescription: "Resume screening result for a candidate against a job description.",
      jsonSchema: screeningResultJsonSchema,
      temperature: 0,
    });

    return validateScreeningResult(initialResult.parsedJson);
  } catch (error) {
    const malformedOutput =
      error instanceof StructuredOutputError
        ? error.rawText
        : error instanceof ResumeScreeningError
          ? "Validation failed for the previous screening output."
          : error instanceof Error
            ? error.message
            : "unknown_error";

    try {
      const repairedResult = await provider.generateStructuredObject({
        systemPrompt,
        userPrompt: buildResumeScreeningRepairPrompt(
          parsedResumeJson,
          input.jobDescription,
          malformedOutput,
        ),
        schemaName: "resume_screening_result_repair",
        schemaDescription: "Repaired resume screening result for a candidate.",
        jsonSchema: screeningResultJsonSchema,
        temperature: 0,
      });

      return validateScreeningResult(repairedResult.parsedJson);
    } catch (repairError) {
      if (repairError instanceof ResumeScreeningError) {
        throw repairError;
      }

      throw new ResumeScreeningError(
        repairError instanceof Error
          ? repairError.message
          : "Resume screening failed after repair attempt.",
      );
    }
  }
}
