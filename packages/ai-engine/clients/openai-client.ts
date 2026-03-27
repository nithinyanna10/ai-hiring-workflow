import type {
  AIProvider,
  StructuredGenerationInput,
  StructuredGenerationResult,
} from "./ai-provider";
import { StructuredOutputError } from "./ai-provider";

export type OpenAIClientConfig = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

type OpenAIResponsesApiResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

function extractOutputText(response: OpenAIResponsesApiResponse) {
  if (typeof response.output_text === "string" && response.output_text.trim().length > 0) {
    return response.output_text;
  }

  const contentParts =
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text?.trim() ?? "")
      .filter(Boolean) ?? [];

  if (contentParts.length > 0) {
    return contentParts.join("\n");
  }

  const refusal =
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((part) => part.type === "refusal" && typeof part.refusal === "string")?.refusal ??
    null;

  if (refusal) {
    throw new Error(`OpenAI refused the request: ${refusal}`);
  }

  throw new Error("OpenAI response did not include structured text output.");
}

export class OpenAIClient implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(config: OpenAIClientConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "gpt-5.2";
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
  }

  async generateStructuredObject(
    input: StructuredGenerationInput,
  ): Promise<StructuredGenerationResult> {
    const response = await fetch(`${this.baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: input.systemPrompt }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: input.userPrompt }],
          },
        ],
        temperature: input.temperature ?? 0,
        text: {
          format: {
            type: "json_schema",
            name: input.schemaName,
            description: input.schemaDescription,
            strict: true,
            schema: input.jsonSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as OpenAIResponsesApiResponse;
    const rawText = extractOutputText(payload);

    try {
      return {
        rawText,
        parsedJson: JSON.parse(rawText),
      };
    } catch (error) {
      throw new StructuredOutputError(
        error instanceof Error ? error.message : "Malformed JSON returned by OpenAI.",
        rawText,
      );
    }

  }
}
