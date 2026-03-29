import type { AdminCandidateActivityItem } from "../../../types";

const EVENT_LABELS: Record<string, string> = {
  "application.submitted": "Application submitted",
  "application.confirmation_email_sent": "Confirmation email sent",
  "application.confirmation_email_failed": "Confirmation email failed",
  "application.screened": "AI screening completed",
  "application.shortlisted": "Auto-shortlisted",
  "application.flagged_for_review": "Flagged for manual review",
  "application.screening_notification_email_sent": "Screening summary email sent",
  "application.screening_notification_email_failed": "Screening summary email failed",
  "application.screening_failed": "Screening failed",
  "application.status_override": "Recruiter status override",
  "recruiter.manual_email_sent": "Recruiter email sent",
  "recruiter.manual_email_failed": "Recruiter email failed",
  "offer.generated": "Offer draft generated",
};

function labelFor(eventType: string) {
  return EVENT_LABELS[eventType] ?? eventType.replace(/\./g, " · ");
}

function timeLabel(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function ActivityTimeline({ items }: { items: AdminCandidateActivityItem[] }) {
  const chronological = [...items].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  if (chronological.length === 0) {
    return (
      <p className="text-sm text-slate-500">No activity events yet — they appear as the pipeline runs.</p>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 pl-6">
      {chronological.map((item) => {
        const payload = item.payloadJson as Record<string, unknown> | null;
        const score =
          typeof payload?.score === "number"
            ? payload.score
            : typeof payload?.score === "string"
              ? Number(payload.score)
              : null;
        return (
          <li key={item.id} className="mb-6 ml-1">
            <div className="absolute -left-[9px] mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-400" />
            <time className="text-xs font-mono text-slate-500">{timeLabel(item.createdAt)}</time>
            <p className="text-sm font-semibold text-slate-900">{labelFor(item.eventType)}</p>
            {item.eventType === "application.screened" && score !== null && !Number.isNaN(score) ? (
              <p className="text-xs text-slate-600">Score {score}</p>
            ) : null}
            {item.note ? <p className="mt-1 text-sm text-slate-600">{item.note}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
