import { OpenAIClient } from "@hiring-workflow/ai-engine";

import { env } from "../env";

function getOpenAiStructuredProvider() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAIClient({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  });
}

/** Structured resume extraction (JSON schema). */
export function getResumeParsingProvider() {
  return getOpenAiStructuredProvider();
}

/** Resume screening, candidate research, and other structured evaluations. */
export function getResumeScreeningProvider() {
  return getOpenAiStructuredProvider();
}
