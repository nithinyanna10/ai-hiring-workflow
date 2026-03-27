import { ClaudeClient, OpenAIClient } from "@hiring-workflow/ai-engine";

import { env } from "../env";

export function getResumeParsingProvider() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAIClient({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  });
}

export function getResumeScreeningProvider() {
  if (!env.CLAUDE_API_KEY) {
    throw new Error("CLAUDE_API_KEY is not configured.");
  }

  return new ClaudeClient({
    apiKey: env.CLAUDE_API_KEY,
    model: env.CLAUDE_MODEL,
  });
}
