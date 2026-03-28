import { StructuredOutputError, type AIProvider } from "../clients/ai-provider";
import {
  buildOnboardingWelcomeSystemPrompt,
  buildOnboardingWelcomeUserPrompt,
} from "../prompts/onboarding-welcome";
import {
  onboardingWelcomeResultJsonSchema,
  onboardingWelcomeResultSchema,
  type OnboardingWelcomeResult,
} from "./onboarding-welcome-schema";

export type OnboardingWelcomeInput = {
  firstName: string;
  jobTitle: string;
  team: string;
  managerName: string | null;
};

function validateResult(candidate: unknown): OnboardingWelcomeResult {
  const parsed = onboardingWelcomeResultSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

export async function generateOnboardingWelcomeWithAI(
  provider: AIProvider,
  input: OnboardingWelcomeInput,
): Promise<OnboardingWelcomeResult> {
  const systemPrompt = buildOnboardingWelcomeSystemPrompt();
  const userPrompt = buildOnboardingWelcomeUserPrompt(input);

  try {
    const result = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt,
      schemaName: "onboarding_welcome_message",
      schemaDescription: "Personalized Slack welcome for a new hire.",
      jsonSchema: onboardingWelcomeResultJsonSchema as unknown as Record<string, unknown>,
      temperature: 0.4,
    });
    return validateResult(result.parsedJson);
  } catch (error) {
    const rawText =
      error instanceof StructuredOutputError
        ? error.rawText
        : error instanceof Error
          ? error.message
          : "unknown_error";
    const repaired = await provider.generateStructuredObject({
      systemPrompt,
      userPrompt: `${userPrompt}\n\nPrevious output was invalid. Fix JSON only. Error: ${rawText}`,
      schemaName: "onboarding_welcome_message_repair",
      schemaDescription: "Repaired onboarding welcome message.",
      jsonSchema: onboardingWelcomeResultJsonSchema as unknown as Record<string, unknown>,
      temperature: 0.2,
    });
    return validateResult(repaired.parsedJson);
  }
}

export function buildTemplateOnboardingWelcome(input: OnboardingWelcomeInput): OnboardingWelcomeResult {
  const manager = input.managerName ? ` I'm looped in with ${input.managerName} as your manager.` : "";
  return {
    welcomeMessage: `Hi ${input.firstName} — welcome to the ${input.team} team as our new ${input.jobTitle}!${manager} So glad you're here. If you need anything as you settle in, just reply in this thread.`,
  };
}
