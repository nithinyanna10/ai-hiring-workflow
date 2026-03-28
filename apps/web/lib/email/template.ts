type ApplicationConfirmationTemplateInput = {
  candidateName: string;
  roleTitle: string;
};

export function buildApplicationConfirmationEmail({
  candidateName,
  roleTitle,
}: ApplicationConfirmationTemplateInput) {
  const subject = `Application received for ${roleTitle}`;
  const text = [
    `Hi ${candidateName},`,
    "",
    `We received your application for the ${roleTitle} role.`,
    "Our team will review your materials and follow up if there is a fit.",
    "",
    "Thank you,",
    "Hiring Team",
  ].join("\n");

  const html = [
    `<p>Hi ${candidateName},</p>`,
    `<p>We received your application for the <strong>${roleTitle}</strong> role.</p>`,
    "<p>Our team will review your materials and follow up if there is a fit.</p>",
    "<p>Thank you,<br />Hiring Team</p>",
  ].join("");

  return {
    subject,
    text,
    html,
  };
}

type ScreeningNotificationTemplateInput = {
  candidateName: string;
  roleTitle: string;
  score: number;
  threshold: number;
  shortlisted: boolean;
};

export function buildScreeningNotificationEmail({
  candidateName,
  roleTitle,
  score,
  threshold,
  shortlisted,
}: ScreeningNotificationTemplateInput) {
  const outcome = shortlisted
    ? `Your profile met our automated review threshold (${threshold}) and has been shortlisted for further consideration.`
    : `Your profile is still under review. Your automated screening score was ${score} (shortlist threshold: ${threshold}).`;

  const subject = shortlisted
    ? `Update: Your application for ${roleTitle}`
    : `Application update: ${roleTitle}`;

  const text = [
    `Hi ${candidateName},`,
    "",
    `We finished an initial automated review of your application for ${roleTitle}.`,
    "",
    `Screening score: ${score} (out of 100).`,
    "",
    outcome,
    "",
    "Thank you,",
    "Hiring Team",
  ].join("\n");

  const html = [
    `<p>Hi ${candidateName},</p>`,
    `<p>We finished an initial automated review of your application for <strong>${roleTitle}</strong>.</p>`,
    `<p><strong>Screening score:</strong> ${score} (out of 100).</p>`,
    `<p>${outcome}</p>`,
    "<p>Thank you,<br />Hiring Team</p>",
  ].join("");

  return { subject, text, html };
}
