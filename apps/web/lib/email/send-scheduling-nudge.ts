import { sendEmail } from "./send-email";
import { buildSchedulingNudgeEmail } from "./template";

type SendSchedulingNudgeInput = {
  to: string;
  candidateName: string;
  roleTitle: string;
  schedulingUrl: string;
};

export async function sendSchedulingNudgeEmail(input: SendSchedulingNudgeInput) {
  const message = buildSchedulingNudgeEmail({
    candidateName: input.candidateName,
    roleTitle: input.roleTitle,
    schedulingUrl: input.schedulingUrl,
  });

  return sendEmail({
    flow: "scheduling_followup_nudge",
    to: input.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
