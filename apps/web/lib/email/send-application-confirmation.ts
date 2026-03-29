import { sendEmail } from "./send-email";
import { buildApplicationConfirmationEmail } from "./template";

type SendApplicationConfirmationInput = {
  candidateEmail: string;
  candidateName: string;
  roleTitle: string;
};

export async function sendApplicationConfirmation({
  candidateEmail,
  candidateName,
  roleTitle,
}: SendApplicationConfirmationInput) {
  const message = buildApplicationConfirmationEmail({
    candidateName,
    roleTitle,
  });

  const result = await sendEmail({
    flow: "application_confirmation",
    to: candidateEmail,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return {
    provider: result.provider,
    messageId: result.messageId,
  };
}
