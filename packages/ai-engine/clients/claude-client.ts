import type {
  AIProvider,
  StructuredGenerationInput,
  StructuredGenerationResult,
} from "./ai-provider";
import { StructuredOutputError } from "./ai-provider";

export type ClaudeClientConfig = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

type ClaudeMessageResponse = {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

function buildClaudeUserPrompt(input: StructuredGenerationInput) {
  return [
    input.userPrompt,
    "",
    "Return JSON that matches this schema exactly:",
    JSON.stringify(input.jsonSchema, null, 2),
  ].join("\n");
}

function extractClaudeText(response: ClaudeMessageResponse) {
  const textParts =
    response.content
      ?.filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean) ?? [];

  if (textParts.length === 0) {
    throw new Error("Claude response did not include text output.");
  }

  return textParts.join("\n");
}

export class ClaudeClient implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: ClaudeClientConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "claude-sonnet-4-20250514";
    this.baseUrl = config.baseUrl ?? "https://api.anthropic.com/v1";
  }

  async generateStructuredObject(
    input: StructuredGenerationInput,
  ): Promise<StructuredGenerationResult> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1600,
        temperature: input.temperature ?? 0,
        system: input.systemPrompt,
        messages: [
          {
            role: "user",
            content: buildClaudeUserPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude request failed (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as ClaudeMessageResponse;
    const rawText = extractClaudeText(payload);

    try {
      return {
        rawText,
        parsedJson: JSON.parse(rawText),
      };
    } catch (error) {
      throw new StructuredOutputError(
        error instanceof Error ? error.message : "Malformed JSON returned by Claude.",
        rawText,
      );
    }
  }
}
