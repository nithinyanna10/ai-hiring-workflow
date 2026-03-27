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
