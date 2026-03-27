import { StructuredOutputError, type AIProvider } from "../clients/ai-provider";
import {
  buildCandidateResearchRepairPrompt,
  buildCandidateResearchSystemPrompt,
  buildCandidateResearchUserPrompt,
} from "../prompts/candidate-research";
import type { StructuredResume } from "../parsers/resume-schema";
import {
  candidateResearchJsonSchema,
  candidateResearchSchema,
  normalizeCandidateResearch,
  type CandidateResearchResult,
} from "./candidate-research-schema";

export type BuildCandidateResearchInput = {
  parsedResume: StructuredResume;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
};

export class CandidateResearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateResearchError";
  }
}

function validateResearchResult(candidate: unknown): CandidateResearchResult {
  const parsed = candidateResearchSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new CandidateResearchError(parsed.error.message);
  }

  return normalizeCandidateResearch(parsed.data);
}

export async function buildCandidateResearchWithAI(
  provider: AIProvider,
  input: BuildCandidateResearchInput,
): Promise<CandidateResearchResult> {
  const systemPrompt = buildCandidateResearchSystemPrompt();
  const parsedResumeJson = JSON.stringify(input.parsedResume, null, 2);
  const userPrompt = buildCandidateResearchUserPrompt({
    parsedResumeJson,
    linkedinUrl: input.linkedinUrl ?? null,
    githubUrl: input.githubUrl ?? null,
    portfolioUrl: input.portfolioUrl ?? null,
  });

  try {
    const initialResult = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt,
      schemaName: "candidate_research_enrichment",
      schemaDescription: "Candidate research enrichment for recruiter preparation.",
      jsonSchema: candidateResearchJsonSchema,
      temperature: 0,
    });

    return validateResearchResult(initialResult.parsedJson);
  } catch (error) {
    const malformedOutput =
      error instanceof StructuredOutputError
        ? error.rawText
        : error instanceof CandidateResearchError
          ? "Validation failed for the previous research enrichment output."
          : error instanceof Error
            ? error.message
            : "unknown_error";

    try {
      const repairedResult = await provider.generateStructuredObject({
        systemPrompt,
        userPrompt: buildCandidateResearchRepairPrompt({
          parsedResumeJson,
          linkedinUrl: input.linkedinUrl ?? null,
          githubUrl: input.githubUrl ?? null,
          portfolioUrl: input.portfolioUrl ?? null,
          malformedOutput,
        }),
        schemaName: "candidate_research_enrichment_repair",
        schemaDescription: "Repaired candidate research enrichment output.",
        jsonSchema: candidateResearchJsonSchema,
        temperature: 0,
      });

      return validateResearchResult(repairedResult.parsedJson);
    } catch (repairError) {
      if (repairError instanceof CandidateResearchError) {
        throw repairError;
      }

      throw new CandidateResearchError(
        repairError instanceof Error
          ? repairError.message
          : "Candidate research enrichment failed after repair attempt.",
      );
    }
  }
}
