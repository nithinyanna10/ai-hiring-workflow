import { getEmailProvider } from "./provider";
import { buildScreeningNotificationEmail } from "./template";

type SendScreeningNotificationInput = {
  candidateEmail: string;
  candidateName: string;
  roleTitle: string;
  score: number;
  threshold: number;
  shortlisted: boolean;
};

export async function sendScreeningNotificationEmail(input: SendScreeningNotificationInput) {
  const provider = getEmailProvider();
  const message = buildScreeningNotificationEmail({
    candidateName: input.candidateName,
    roleTitle: input.roleTitle,
    score: input.score,
    threshold: input.threshold,
    shortlisted: input.shortlisted,
  });

  const result = await provider.send({
    to: input.candidateEmail,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return {
    provider: result.provider,
    messageId: result.messageId,
  };
}
