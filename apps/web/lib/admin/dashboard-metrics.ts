import { ApplicationStatus, JobStatus } from "@prisma/client";

import { db } from "../db";

/** Start of local calendar day for “today” metrics. */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAdminDashboardMetrics() {
  const today = startOfToday();

  const [
    activeRoles,
    candidatesInPipeline,
    interviewsPending,
    appliedToday,
    screenedToday,
    shortlisted,
    needsRecruiterReview,
    offerDrafted,
    offerSent,
    offerSigned,
    totalApplications,
    screenedEver,
    shortlistedEver,
    interviewStage,
    offerStage,
  ] = await Promise.all([
    db.job.count({ where: { status: JobStatus.OPEN } }),
    db.application.count({
      where: {
        currentStatus: {
          notIn: [
            ApplicationStatus.REJECTED,
            ApplicationStatus.WITHDRAWN,
            ApplicationStatus.HIRED,
            ApplicationStatus.ONBOARDED,
          ],
        },
      },
    }),
    db.interview.count({ where: { completedAt: null } }),
    db.application.count({ where: { submittedAt: { gte: today } } }),
    db.application.count({
      where: {
        reviewedAt: { gte: today },
        aiScreenScore: { not: null },
      },
    }),
    db.application.count({ where: { currentStatus: ApplicationStatus.SHORTLISTED } }),
    db.application.count({
      where: {
        currentStatus: {
          in: [ApplicationStatus.SCREENED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.PHONE_SCREEN],
        },
      },
    }),
    db.application.count({ where: { currentStatus: ApplicationStatus.OFFER_DRAFT } }),
    db.application.count({ where: { currentStatus: ApplicationStatus.OFFER_SENT } }),
    db.application.count({ where: { currentStatus: ApplicationStatus.OFFER_SIGNED } }),
    db.application.count(),
    db.application.count({ where: { aiScreenScore: { not: null } } }),
    db.application.count({ where: { currentStatus: ApplicationStatus.SHORTLISTED } }),
    db.application.count({
      where: {
        currentStatus: {
          in: [ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEWING],
        },
      },
    }),
    db.application.count({
      where: {
        currentStatus: {
          in: [
            ApplicationStatus.OFFER_DRAFT,
            ApplicationStatus.OFFER_SENT,
            ApplicationStatus.OFFER_SIGNED,
          ],
        },
      },
    }),
  ]);

  const offersInProgress =
    offerDrafted + offerSent + offerSigned;

  return {
    activeRoles,
    candidatesInPipeline,
    interviewsPending,
    appliedToday,
    screenedToday,
    shortlisted,
    needsRecruiterReview,
    offersInProgress,
    offerDrafted,
    offerSent,
    offerSigned,
    funnel: {
      totalApplications,
      screenedEver,
      shortlistedEver,
      interviewStage,
      offerStage,
    },
  };
}
