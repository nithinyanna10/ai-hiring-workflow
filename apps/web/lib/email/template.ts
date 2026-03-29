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

type SchedulingSlotsOfferInput = {
  candidateName: string;
  roleTitle: string;
  schedulingUrl: string;
  slotLines: string[];
  holdExpiresAt: Date;
};

export function buildSchedulingSlotsOfferEmail({
  candidateName,
  roleTitle,
  schedulingUrl,
  slotLines,
  holdExpiresAt,
}: SchedulingSlotsOfferInput) {
  const expires = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(holdExpiresAt);

  const subject = `Choose your interview time — ${roleTitle}`;
  const slotsBlock = slotLines.map((line) => `• ${line}`).join("\n");
  const text = [
    `Hi ${candidateName},`,
    "",
    `We would like to schedule an interview for the ${roleTitle} role.`,
    "",
    "Please pick one of the offered times before the hold expires:",
    "",
    slotsBlock,
    "",
    `Hold expires: ${expires} (your local timezone may differ).`,
    "",
    `Use your private scheduling link to confirm a slot:`,
    schedulingUrl,
    "",
    "Thank you,",
    "Hiring Team",
  ].join("\n");

  const html = [
    `<p>Hi ${candidateName},</p>`,
    `<p>We would like to schedule an interview for the <strong>${roleTitle}</strong> role.</p>`,
    "<p><strong>Offered times</strong></p>",
    "<ul>",
    ...slotLines.map((line) => `<li>${line}</li>`),
    "</ul>",
    `<p><strong>Hold expires:</strong> ${expires}</p>`,
    `<p><a href="${schedulingUrl}">Open scheduling page</a></p>`,
    "<p>Thank you,<br />Hiring Team</p>",
  ].join("");

  return { subject, text, html };
}

type SchedulingNudgeInput = {
  candidateName: string;
  roleTitle: string;
  schedulingUrl: string;
};

export function buildSchedulingNudgeEmail({
  candidateName,
  roleTitle,
  schedulingUrl,
}: SchedulingNudgeInput) {
  const subject = `Reminder: pick an interview slot — ${roleTitle}`;
  const text = [
    `Hi ${candidateName},`,
    "",
    `This is a friendly reminder to choose an interview time for ${roleTitle}.`,
    "Your offered slots are still available until the hold expires.",
    "",
    schedulingUrl,
    "",
    "Thank you,",
    "Hiring Team",
  ].join("\n");

  const html = [
    `<p>Hi ${candidateName},</p>`,
    `<p>This is a friendly reminder to choose an interview time for <strong>${roleTitle}</strong>.</p>`,
    `<p><a href="${schedulingUrl}">Open scheduling page</a></p>`,
    "<p>Thank you,<br />Hiring Team</p>",
  ].join("");

  return { subject, text, html };
}

type AdminOfferSignedAlertInput = {
  candidateName: string;
  roleTitle: string;
  applicationId: string;
  adminCandidateUrl: string;
};

export function buildAdminOfferSignedAlertEmail({
  candidateName,
  roleTitle,
  applicationId,
  adminCandidateUrl,
}: AdminOfferSignedAlertInput) {
  const subject = `Offer signed: ${candidateName} — ${roleTitle}`;
  const text = [
    "An offer was signed.",
    "",
    `Candidate: ${candidateName}`,
    `Role: ${roleTitle}`,
    `Application id: ${applicationId}`,
    "",
    `Admin: ${adminCandidateUrl}`,
  ].join("\n");

  const html = [
    "<p><strong>An offer was signed.</strong></p>",
    `<p>Candidate: ${candidateName}<br />Role: ${roleTitle}<br />Application: <code>${applicationId}</code></p>`,
    `<p><a href="${adminCandidateUrl}">Open candidate in admin</a></p>`,
  ].join("");

  return { subject, text, html };
}
