import {
  buildTemplateOnboardingWelcome,
  ClaudeClient,
  generateOnboardingWelcomeWithAI,
} from "@hiring-workflow/ai-engine";

import { env } from "../env";

export type WelcomeMessageSource = "claude" | "template";

export async function resolveOnboardingWelcomeMessage(input: {
  firstName: string;
  jobTitle: string;
  team: string;
  managerName: string | null;
}): Promise<{ message: string; source: WelcomeMessageSource }> {
  if (!env.CLAUDE_API_KEY) {
    const { welcomeMessage } = buildTemplateOnboardingWelcome(input);
    return { message: welcomeMessage, source: "template" };
  }

  const provider = new ClaudeClient({
    apiKey: env.CLAUDE_API_KEY,
    model: env.CLAUDE_MODEL,
  });

  const { welcomeMessage } = await generateOnboardingWelcomeWithAI(provider, input);
  return { message: welcomeMessage, source: "claude" };
}
