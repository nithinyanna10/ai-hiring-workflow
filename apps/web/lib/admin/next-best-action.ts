import { ApplicationStatus } from "@prisma/client";

export type NextBestAction = {
  headline: string;
  detail: string;
};

/**
 * Operational hint for recruiters — driven by status + screening decision path + confidence.
 */
export function getNextBestAction(input: {
  status: ApplicationStatus;
  aiScore: number | null;
  aiConfidence: string | null;
  screeningThreshold: number;
  screeningDecisionPath?: string | null;
}): NextBestAction {
  const { status, aiScore, aiConfidence, screeningDecisionPath } = input;

  if (status === ApplicationStatus.APPLIED) {
    return {
      headline: "Automated screening in progress",
      detail:
        "Resume extraction, parse (with inference pass), scoring, and routing run automatically after submit. Refresh shortly.",
    };
  }

  if (status === ApplicationStatus.SCREENED && aiScore === null) {
    return {
      headline: "Screening did not complete",
      detail:
        "Check the activity timeline for extraction or parsing errors. You can still email the candidate or override status.",
    };
  }

  if (status === ApplicationStatus.UNDER_REVIEW) {
    return {
      headline: "Manual review (recruiter queue)",
      detail:
        "Routed here because score ≥ 60 and/or model confidence was medium — not a cold reject. Decide: shortlist, reject, or request more information.",
    };
  }

  if (status === ApplicationStatus.SCREENED && screeningDecisionPath === "screened_only") {
    return {
      headline: "Reject or request more information",
      detail:
        "Did not meet auto shortlist or manual-review routing (low score and low confidence). Use override or email if you still see a fit.",
    };
  }

  if (
    status === ApplicationStatus.SCREENED &&
    aiScore !== null &&
    screeningDecisionPath !== "screened_only"
  ) {
    const conf = aiConfidence ? ` Confidence: ${aiConfidence}.` : "";
    return {
      headline: "Review screening outcome",
      detail: `Score ${aiScore}.${conf} Check the AI routing label above — status should match the decision path in the activity timeline.`,
    };
  }

  switch (status) {
    case ApplicationStatus.SHORTLISTED:
      return {
        headline: "Strong fit — schedule interview",
        detail:
          "Auto-shortlisted (score ≥ 75 and high confidence). Open Scheduling to offer slots and send the secure candidate link.",
      };
    case ApplicationStatus.PHONE_SCREEN:
      return {
        headline: "Phone screen in progress",
        detail: "Complete the call and update status or move to scheduling.",
      };
    case ApplicationStatus.INTERVIEW_SCHEDULED:
    case ApplicationStatus.INTERVIEWING:
      return {
        headline: "Interview in motion",
        detail: "Capture feedback, then advance toward offer or close out.",
      };
    case ApplicationStatus.OFFER_DRAFT:
      return {
        headline: "Offer ready for review",
        detail: "Open Offer to review AI draft text, timestamp, and candidate signing link when ready.",
      };
    case ApplicationStatus.OFFER_SENT:
      return {
        headline: "Awaiting signature",
        detail: "Candidate signs via tokenized link; track status on the Offer page.",
      };
    case ApplicationStatus.OFFER_SIGNED:
    case ApplicationStatus.HIRED:
    case ApplicationStatus.ONBOARDING:
      return {
        headline: "Finalize hiring / onboarding",
        detail: "Complete internal steps; Slack tools appear when status allows.",
      };
    case ApplicationStatus.ONBOARDED:
      return {
        headline: "Done",
        detail: "Candidate onboarded.",
      };
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.WITHDRAWN:
      return {
        headline: "Closed",
        detail: "No further automated actions.",
      };
    default:
      return {
        headline: "Recruiter action",
        detail: "Use email, scheduling, offer, or override tools on this page.",
      };
  }
}
