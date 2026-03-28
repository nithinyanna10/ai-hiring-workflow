import { ApplicationStatus, JobStatus } from "@prisma/client";

import { db } from "../db";

/** Applications still in the hiring pipeline (not closed out). */
const PIPELINE_TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
  ApplicationStatus.HIRED,
  ApplicationStatus.ONBOARDED,
];

export async function getAdminDashboardMetrics() {
  const [activeRoles, candidatesInPipeline, interviewsPending] = await Promise.all([
    db.job.count({ where: { status: JobStatus.OPEN } }),
    db.application.count({
      where: { currentStatus: { notIn: PIPELINE_TERMINAL_STATUSES } },
    }),
    db.interview.count({ where: { completedAt: null } }),
  ]);

  return {
    activeRoles,
    candidatesInPipeline,
    interviewsPending,
  };
}
