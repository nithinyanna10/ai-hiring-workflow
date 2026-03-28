import type { SlackProvider } from "@hiring-workflow/shared";

import { env } from "../env";
import { MockSlackProvider } from "./mock-slack-provider";
import { SlackApiProvider } from "./slack-api-provider";

export function getSlackProvider(): SlackProvider {
  if (env.SLACK_PROVIDER === "mock") {
    return new MockSlackProvider();
  }

  if (!env.SLACK_BOT_TOKEN) {
    throw new Error("SLACK_BOT_TOKEN is required when SLACK_PROVIDER=slack_api.");
  }

  return new SlackApiProvider(env.SLACK_BOT_TOKEN);
}
