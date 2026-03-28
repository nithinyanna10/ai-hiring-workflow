import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "../../../../components/admin/candidates/status-badge";
import { CandidateDetailSection } from "../../../../components/admin/candidate-detail/detail-section";
import { CandidateDetailSectionNav } from "../../../../components/admin/candidate-detail/section-nav";
import { CandidateOverrideForm } from "../../../../components/admin/candidate-detail/override-form";
import { DetailGridItem } from "../../../../components/admin/candidate-detail/detail-grid";
import { ParsedResumeSummary } from "../../../../components/admin/candidate-detail/parsed-resume-summary";
import { StringList } from "../../../../components/admin/candidate-detail/string-list";
import { getAdminCandidateDetail } from "../../../../lib/admin/candidate-detail";
import { RecruiterEmailForm } from "../../../../components/admin/candidate-detail/recruiter-email-form";
import { SlackOnboardingForm } from "../../../../components/admin/candidate-detail/slack-onboarding-form";
import {
  applyAdminOverrideAction,
  sendRecruiterEmailAction,
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
                  <ParsedResumeSummary parsedResumeJson={detail.parsedResumeJson} />
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailGridItem label="AI screening score" value={detail.aiScore ?? "Pending"} />
                  <DetailGridItem label="Current status" value={formatStatusLabel(detail.currentStatus)} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-900">Rationale</h3>
                  <p className="text-sm leading-6 text-slate-700">
                    {detail.aiSummary ?? "No AI rationale has been stored yet."}
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

            <CandidateDetailSection id="research" title="Research">
              <p className="text-sm leading-6 text-slate-700">
                {detail.researchSummary ?? "No research summary is available for this application yet."}
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

            <CandidateDetailSection id="activity" title="Activity Log">
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
