import { ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "../db";
import type {
  AdminCandidateFilterOption,
  AdminCandidateFilters,
  AdminCandidateListItem,
} from "../../types";

const candidateFilterSchema = z.object({
  role: z.string().trim().optional().default(""),
  status: z.union([z.literal(""), z.nativeEnum(ApplicationStatus)]).optional().default(""),
  dateFrom: z.string().trim().optional().default(""),
  dateTo: z.string().trim().optional().default(""),
});

type CandidateFilterInput = Record<string, string | string[] | undefined>;

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseDateBoundary(value: string, boundary: "start" | "end") {
  if (!value) {
    return null;
  }

  const isoValue = boundary === "start" ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
  const parsed = new Date(isoValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseAdminCandidateFilters(
  searchParams: CandidateFilterInput,
): AdminCandidateFilters {
  const parsed = candidateFilterSchema.parse({
    role: getSearchParamValue(searchParams.role),
    status: getSearchParamValue(searchParams.status),
    dateFrom: getSearchParamValue(searchParams.dateFrom),
    dateTo: getSearchParamValue(searchParams.dateTo),
  });

  return parsed;
}

function buildCandidateWhere(filters: AdminCandidateFilters): Prisma.ApplicationWhereInput {
  const submittedAt: Prisma.DateTimeFilter = {};
  const fromDate = parseDateBoundary(filters.dateFrom, "start");
  const toDate = parseDateBoundary(filters.dateTo, "end");

  if (fromDate) {
    submittedAt.gte = fromDate;
  }

  if (toDate) {
    submittedAt.lte = toDate;
  }

  return {
    ...(filters.role ? { job: { slug: filters.role } } : {}),
    ...(filters.status
      ? { currentStatus: filters.status as ApplicationStatus }
      : {}),
    ...(fromDate || toDate ? { submittedAt } : {}),
  };
}

export async function getAdminCandidateFilters() {
  const [roles] = await Promise.all([
    db.job.findMany({
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
      },
    }),
  ]);

  const roleOptions: AdminCandidateFilterOption[] = roles.map((job) => ({
    value: job.slug,
    label: job.title,
  }));

  const statusOptions: AdminCandidateFilterOption[] = Object.values(ApplicationStatus).map(
    (status) => ({
      value: status,
      label: status
        .toLowerCase()
        .split("_")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" "),
    }),
  );

  return {
    roleOptions,
    statusOptions,
  };
}

export async function getAdminCandidates(filters: AdminCandidateFilters): Promise<AdminCandidateListItem[]> {
  const applications = await db.application.findMany({
    where: buildCandidateWhere(filters),
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      currentStatus: true,
      aiScreenScore: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      job: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return applications.map((application) => ({
    applicationId: application.id,
    candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`.trim(),
    roleTitle: application.job.title,
    roleSlug: application.job.slug,
    submittedAt: application.submittedAt,
    aiScore: application.aiScreenScore ? Number(application.aiScreenScore) : null,
    currentStatus: application.currentStatus,
  }));
}
