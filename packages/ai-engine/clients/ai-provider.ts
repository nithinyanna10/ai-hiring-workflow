export type StructuredGenerationInput = {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schemaDescription: string;
  jsonSchema: Record<string, unknown>;
  temperature?: number;
};

export type StructuredGenerationResult = {
  rawText: string;
  parsedJson: unknown;
};

export class StructuredOutputError extends Error {
  readonly rawText: string;

  constructor(message: string, rawText: string) {
    super(message);
    this.name = "StructuredOutputError";
    this.rawText = rawText;
  }
}

export interface AIProvider {
  generateStructuredObject(
    input: StructuredGenerationInput,
  ): Promise<StructuredGenerationResult>;
}
