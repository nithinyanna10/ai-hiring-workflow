export function AutomationCallout() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <p className="font-semibold text-blue-900">What runs automatically today</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-blue-900/90">
        <li>
          <strong>Apply</strong> — resume file saved to disk; confirmation email via configured
          provider;{" "}
          <strong>screening pipeline runs in the same request</strong> (extract → parse → score →
          DB + status history + activity events).
        </li>
        <li>
          <strong>Shortlist</strong> — if score ≥ threshold, status moves to SHORTLISTED and events
          are logged (no recruiter click).
        </li>
        <li>
          <strong>Manual</strong> — shortlist/reject override, recruiter email, slot generation,
          offer draft button, Slack onboarding simulation — require human or explicit admin action.
        </li>
      </ul>
    </div>
  );
}
