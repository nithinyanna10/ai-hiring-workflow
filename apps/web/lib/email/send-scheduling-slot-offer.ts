import { sendEmail } from "./send-email";
import { buildSchedulingSlotsOfferEmail } from "./template";

function formatSlotLine(
  startTime: Date,
  endTime: Date,
  timezone: string | null,
) {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = new Intl.DateTimeFormat("en-US", opts).format(startTime);
  const end = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    endTime,
  );
  const tz = timezone?.trim() || "local";
  return `${start} – ${end} (${tz})`;
}

type SendSchedulingSlotsOfferInput = {
  to: string;
  candidateName: string;
  roleTitle: string;
  schedulingUrl: string;
  slots: Array<{
    startTime: Date;
    endTime: Date;
    timezone: string | null;
  }>;
  holdExpiresAt: Date;
};

export async function sendSchedulingSlotsOfferEmail(input: SendSchedulingSlotsOfferInput) {
  const slotLines = input.slots.map((s) => formatSlotLine(s.startTime, s.endTime, s.timezone));
  const message = buildSchedulingSlotsOfferEmail({
    candidateName: input.candidateName,
    roleTitle: input.roleTitle,
    schedulingUrl: input.schedulingUrl,
    slotLines,
    holdExpiresAt: input.holdExpiresAt,
  });

  return sendEmail({
    flow: "scheduling_slots_offered",
    to: input.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
