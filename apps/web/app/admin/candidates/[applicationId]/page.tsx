import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";

import { ActivityTimeline } from "../../../../components/admin/candidate-detail/activity-timeline";
import { AutomationCallout } from "../../../../components/admin/candidate-detail/automation-callout";
import { NextBestActionCard } from "../../../../components/admin/candidate-detail/next-best-action-card";
import { SchedulingOfferSummary } from "../../../../components/admin/candidate-detail/scheduling-offer-summary";
import { WorkflowPipeline } from "../../../../components/admin/candidate-detail/workflow-pipeline";
import { StatusBadge } from "../../../../components/admin/candidates/status-badge";
import { CandidateDetailSection } from "../../../../components/admin/candidate-detail/detail-section";
import { CandidateDetailSectionNav } from "../../../../components/admin/candidate-detail/section-nav";
import { CandidateOverrideForm } from "../../../../components/admin/candidate-detail/override-form";
import { DetailGridItem } from "../../../../components/admin/candidate-detail/detail-grid";
import { ParsedResumeSummary } from "../../../../components/admin/candidate-detail/parsed-resume-summary";
import { StringList } from "../../../../components/admin/candidate-detail/string-list";
import { getAdminCandidateDetail } from "../../../../lib/admin/candidate-detail";
import { getNextBestAction } from "../../../../lib/admin/next-best-action";
import { InterviewNotesPanel } from "../../../../components/admin/candidate-detail/interview-notes-panel";
import { RecruiterEmailForm } from "../../../../components/admin/candidate-detail/recruiter-email-form";
import { SlackOnboardingForm } from "../../../../components/admin/candidate-detail/slack-onboarding-form";
import {
  applyAdminOverrideAction,
  sendRecruiterEmailAction,
  simulateMockNotetakerAction,
  simulateSlackJoinOnboardingAction,
} from "./actions";
import type { RouteParams } from "../../../../types";

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatStatusLabel(value: string | null) {
  if (!value) {
    return "None";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatJsonPreview(value: unknown) {
  if (!value) {
    return null;
  }

  return JSON.stringify(value, null, 2);
}

export default async function AdminCandidateDetailPage({
  params,
}: RouteParams<{ applicationId: string }>) {
  const { applicationId } = await params;
  const detail = await getAdminCandidateDetail(applicationId);

  if (!detail) {
    notFound();
  }

  const statusEnum = detail.currentStatus as ApplicationStatus;
  const nextBest = getNextBestAction({
    status: statusEnum,
    aiScore: detail.aiScore,
    aiConfidence: detail.aiConfidence,
    screeningThreshold: detail.screeningThreshold,
    screeningDecisionPath: detail.screeningDecisionPath,
  });

  const profileLinks = [
    detail.candidate.linkedinUrl
      ? { label: "LinkedIn (application)", href: detail.candidate.linkedinUrl }
      : null,
    detail.candidate.portfolioUrl
      ? { label: "Portfolio (application)", href: detail.candidate.portfolioUrl }
      : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/admin/candidates" className="text-sm text-slate-500">
            Back to candidates
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Candidate Review
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {detail.candidate.fullName}
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                {detail.job.title} · {detail.job.team} · {detail.job.location} /{" "}
                {detail.job.workModel}
              </p>
            </div>
            <StatusBadge status={detail.currentStatus} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <WorkflowPipeline currentStatus={statusEnum} />
          <NextBestActionCard action={nextBest} />
        </div>

        <AutomationCallout />

        <SchedulingOfferSummary applicationId={detail.applicationId} detail={detail} />

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Activity timeline
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Chronological system and recruiter events — primary audit trail for the pipeline.
          </p>
          <div className="mt-4">
            <ActivityTimeline items={detail.activityLog} />
          </div>
        </section>

        <dl className="grid gap-4 rounded-lg border border-border bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
          <DetailGridItem label="Email" value={detail.candidate.email} />
          <DetailGridItem label="Phone" value={detail.candidate.phone ?? "Not provided"} />
          <DetailGridItem label="Submitted" value={formatDateTime(detail.submittedAt)} />
          <DetailGridItem label="AI score" value={detail.aiScore ?? "Pending"} />
          <DetailGridItem label="LinkedIn" value={detail.candidate.linkedinUrl ?? "Not provided"} />
          <DetailGridItem
            label="Portfolio"
            value={detail.candidate.portfolioUrl ?? "Not provided"}
          />
          <DetailGridItem label="Role level" value={detail.job.level} />
          <DetailGridItem label="Reviewed" value={formatDateTime(detail.reviewedAt)} />
        </dl>

        <CandidateDetailSectionNav />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <CandidateDetailSection id="resume" title="Resume">
              <div className="space-y-4">
                <a
                  href={detail.resumeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded border border-slate-300 px-4 py-2 text-sm no-underline"
                >
                  Open resume file
                </a>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-900">Parsed resume summary</h3>
                  <ParsedResumeSummary
                    parsedResumeJson={detail.parsedResumeJson}
                    profileLinks={profileLinks}
                    parseMeta={detail.parseMeta}
                  />
                </div>
                {detail.parsedResumeJson ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-900">Raw parsed JSON</h3>
                    <pre className="overflow-x-auto rounded bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                      {formatJsonPreview(detail.parsedResumeJson)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </CandidateDetailSection>

            <CandidateDetailSection id="screening" title="AI Screening">
              <div className="space-y-6">
                {detail.screeningDecisionPath ? (
                  <div className="rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950">
                    <span className="font-semibold">Routing decision: </span>
                    <span className="font-mono">
                      {detail.screeningDecisionPath.replace(/_/g, " ")}
                    </span>
                    <span className="text-violet-800">
                      {" "}
                      (score + confidence rules — see architecture docs)
                    </span>
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailGridItem label="Score" value={detail.aiScore ?? "Pending"} />
                  <DetailGridItem
                    label="Confidence"
                    value={detail.aiConfidence ?? "—"}
                  />
                  <DetailGridItem
                    label="Recommendation"
                    value={detail.aiRecommendation ?? "—"}
                  />
                  <DetailGridItem
                    label="Legacy threshold (log only)"
                    value={String(detail.screeningThreshold)}
                  />
                  <DetailGridItem label="Current status" value={formatStatusLabel(detail.currentStatus)} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-900">Rationale</h3>
                  <p className="text-sm leading-6 text-slate-700">
                    {detail.aiSummary ?? "No AI rationale has been stored yet."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-900">Recruiter takeaway</h3>
                  <p className="text-sm leading-6 text-slate-700">
                    {detail.aiSummary
                      ? "Use score, confidence, strengths, and gaps together — not the score alone."
                      : "Pending screening output."}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900">Strengths</h3>
                    <StringList
                      items={detail.strengths}
                      emptyLabel="No strengths have been stored yet."
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-900">Gaps</h3>
                    <StringList items={detail.gaps} emptyLabel="No gaps have been stored yet." />
                  </div>
                </div>
              </div>
            </CandidateDetailSection>

            <CandidateDetailSection id="interview" title="Interview notes (notetaker)">
              <InterviewNotesPanel
                applicationId={detail.applicationId}
                interviews={detail.interviews}
                action={simulateMockNotetakerAction}
              />
            </CandidateDetailSection>

            <CandidateDetailSection id="research" title="Research">
              <p className="text-sm leading-6 text-slate-700">
                {detail.researchSummary ?? "No research summary is available for this application yet."}
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Sources used for synthesis (resume + URLs — not live LinkedIn/X/GitHub scraping):{" "}
                {detail.researchSourceLinks ? (
                  <span className="block font-mono text-[11px] text-slate-600">
                    LinkedIn: {detail.researchSourceLinks.linkedinUrl ?? "—"} · GitHub:{" "}
                    {detail.researchSourceLinks.githubUrl ?? "—"} · Portfolio:{" "}
                    {detail.researchSourceLinks.portfolioUrl ?? "—"}
                  </span>
                ) : (
                  " run research after shortlist to populate structured links."
                )}
              </p>
            </CandidateDetailSection>

            <CandidateDetailSection id="history" title="Status History">
              {detail.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500">No status history entries yet.</p>
              ) : (
                <div className="space-y-4">
                  {detail.statusHistory.map((item) => (
                    <article key={item.id} className="rounded border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                          {formatStatusLabel(item.fromStatus)} to {formatStatusLabel(item.toStatus)}
                        </p>
                        <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Actor: {formatStatusLabel(item.actorType)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.note ?? "No note provided."}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </CandidateDetailSection>

            <CandidateDetailSection id="activity" title="Activity (raw payloads)">
              {detail.activityLog.length === 0 ? (
                <p className="text-sm text-slate-500">No activity events yet.</p>
              ) : (
                <div className="space-y-4">
                  {detail.activityLog.map((item) => (
                    <article key={item.id} className="rounded border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">{item.eventType}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Actor: {formatStatusLabel(item.actorType)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.note ?? "No note provided."}
                      </p>
                      {item.payloadJson ? (
                        <pre className="mt-3 overflow-x-auto rounded bg-slate-50 p-3 text-xs leading-6 text-slate-700">
                          {formatJsonPreview(item.payloadJson)}
                        </pre>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </CandidateDetailSection>
          </div>

          <div className="space-y-6">
            <CandidateOverrideForm
              applicationId={detail.applicationId}
              action={applyAdminOverrideAction}
            />
            <div className="rounded-lg border border-border bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight">Email candidate</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Send a manual message regardless of automated screening score (e.g. follow-up or
                encouragement).
              </p>
              <div className="mt-4">
                <RecruiterEmailForm
                  applicationId={detail.applicationId}
                  candidateEmail={detail.candidate.email}
                  action={sendRecruiterEmailAction}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight">Scheduling</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Generate interview slot offers and share a candidate scheduling link.
              </p>
              <Link
                href={`/admin/candidates/${detail.applicationId}/schedule`}
                className="mt-4 inline-flex rounded border border-slate-300 px-4 py-2 text-sm no-underline"
              >
                Manage scheduling
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight">Offer</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Draft and store an offer letter for later PDF generation or signature steps.
              </p>
              <Link
                href={`/admin/candidates/${detail.applicationId}/offer`}
                className="mt-4 inline-flex rounded border border-slate-300 px-4 py-2 text-sm no-underline"
              >
                Generate offer
              </Link>
            </div>
            {detail.currentStatus === "ONBOARDING" ? (
              <div className="rounded-lg border border-border bg-white p-6">
                <h2 className="text-lg font-semibold tracking-tight">Slack onboarding</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  After the candidate joins the workspace (or in demo environments), run the welcome
                  phase: AI-generated message, HR Slack notification, and status{" "}
                  <span className="font-medium">ONBOARDED</span>. Invite delivery is separate and
                  already ran when the offer was signed.
                </p>
                <div className="mt-4">
                  <SlackOnboardingForm
                    applicationId={detail.applicationId}
                    action={simulateSlackJoinOnboardingAction}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
