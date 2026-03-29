/** Deterministic mock transcript + summary for demo / Fireflies-style ingestion. */
export function buildMockInterviewNotes(input: {
  candidateName: string;
  roleTitle: string;
  interviewStart: Date;
}) {
  const when = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input.interviewStart);

  const transcriptText = [
    `[Mock notetaker — ${when}]`,
    "",
    `Interviewer: Thanks for joining today. Let's start with your experience relevant to ${input.roleTitle}.`,
    "",
    `${input.candidateName}: I led migration of our billing service to event-driven architecture, which cut p95 latency by about 40%.`,
    "",
    "Interviewer: How did you handle failure modes?",
    "",
    `${input.candidateName}: We used idempotent consumers, dead-letter queues, and runbooks tied to SLO alerts.`,
    "",
    "Interviewer: Any trade-offs?",
    "",
    `${input.candidateName}: Higher operational complexity; we invested in observability and on-call rotation.`,
    "",
    "[End of mock transcript]",
  ].join("\n");

  const feedbackSummary = [
    "Strong system design articulation with concrete metrics.",
    "Clear ownership of reliability practices (DLQ, idempotency, on-call).",
    "Good fit for senior IC track; probe deeper on stakeholder management next round.",
  ].join(" ");

  return { transcriptText, feedbackSummary };
}
