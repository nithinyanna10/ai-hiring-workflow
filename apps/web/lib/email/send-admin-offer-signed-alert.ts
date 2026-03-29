import { env } from "../env";
import { sendEmail } from "./send-email";
import { buildAdminOfferSignedAlertEmail } from "./template";

type SendAdminOfferSignedAlertInput = {
  candidateName: string;
  roleTitle: string;
  applicationId: string;
};

export async function sendAdminOfferSignedAlertIfConfigured(input: SendAdminOfferSignedAlertInput) {
  const to = env.ADMIN_ALERT_EMAIL;
  if (!to) {
    return { sent: false as const, reason: "ADMIN_ALERT_EMAIL unset" as const };
  }

  const adminCandidateUrl = `${env.NEXT_PUBLIC_APP_URL}/admin/candidates/${input.applicationId}`;
  const message = buildAdminOfferSignedAlertEmail({
    candidateName: input.candidateName,
    roleTitle: input.roleTitle,
    applicationId: input.applicationId,
    adminCandidateUrl,
  });

  await sendEmail({
    flow: "admin_offer_signed_alert",
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return { sent: true as const };
}
