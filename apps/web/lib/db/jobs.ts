import { JobStatus } from "@prisma/client";

import { db } from "./client";
import type { ApplyJobOption, PublicJobDetail, PublicJobSummary } from "../../types";

export async function getOpenJobs(): Promise<PublicJobSummary[]> {
  return db.job.findMany({
    where: { status: JobStatus.OPEN },
    orderBy: [{ openedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      team: true,
      location: true,
      workModel: true,
      level: true,
      description: true,
    },
  });
}

export async function getOpenJobBySlug(slug: string): Promise<PublicJobDetail | null> {
  return db.job.findFirst({
    where: {
      slug,
      status: JobStatus.OPEN,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      team: true,
      location: true,
      workModel: true,
      level: true,
      description: true,
      responsibilities: true,
      requirements: true,
    },
  });
}

export async function getJobBySlug(slug: string) {
  return db.job.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      team: true,
      location: true,
      workModel: true,
      level: true,
      description: true,
      status: true,
    },
  });
}

export async function getOpenJobOptions(): Promise<ApplyJobOption[]> {
  return db.job.findMany({
    where: { status: JobStatus.OPEN },
    orderBy: [{ openedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      location: true,
      workModel: true,
    },
  });
}
