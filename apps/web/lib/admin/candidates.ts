import { ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "../db";
import type {
  AdminCandidateFilterOption,
  AdminCandidateFilters,
  AdminCandidateListItem,
} from "../../types";

const pipelineBucketValues = [
  "",
  "applied",
  "screening",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
  "hired",
] as const;

const candidateFilterSchema = z.object({
  role: z.string().trim().optional().default(""),
  status: z.union([z.literal(""), z.nativeEnum(ApplicationStatus)]).optional().default(""),
  bucket: z.enum(pipelineBucketValues).optional().default(""),
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

function statusesForPipelineBucket(bucket: string): ApplicationStatus[] | null {
  switch (bucket) {
    case "applied":
      return [ApplicationStatus.APPLIED];
    case "screening":
      return [
        ApplicationStatus.SCREENED,
        ApplicationStatus.UNDER_REVIEW,
        ApplicationStatus.PHONE_SCREEN,
      ];
    case "shortlisted":
      return [ApplicationStatus.SHORTLISTED];
    case "interview":
      return [ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEWING];
    case "offer":
      return [
        ApplicationStatus.OFFER_DRAFT,
        ApplicationStatus.OFFER_SENT,
        ApplicationStatus.OFFER_SIGNED,
      ];
    case "rejected":
      return [ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN];
    case "hired":
      return [ApplicationStatus.HIRED, ApplicationStatus.ONBOARDING, ApplicationStatus.ONBOARDED];
    default:
      return null;
  }
}

export function parseAdminCandidateFilters(
  searchParams: CandidateFilterInput,
): AdminCandidateFilters {
  const raw = {
    role: getSearchParamValue(searchParams.role),
    status: getSearchParamValue(searchParams.status),
    bucket: getSearchParamValue(searchParams.bucket),
    dateFrom: getSearchParamValue(searchParams.dateFrom),
    dateTo: getSearchParamValue(searchParams.dateTo),
  };

  const parsed = candidateFilterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      role: raw.role,
      status: "",
      bucket: "",
      dateFrom: raw.dateFrom,
      dateTo: raw.dateTo,
    };
  }

  return parsed.data;
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

  const bucketStatuses = filters.bucket ? statusesForPipelineBucket(filters.bucket) : null;
  const statusFilter: Prisma.ApplicationWhereInput =
    bucketStatuses && bucketStatuses.length > 0
      ? { currentStatus: { in: bucketStatuses } }
      : filters.status
        ? { currentStatus: filters.status as ApplicationStatus }
        : {};

  return {
    ...(filters.role ? { job: { slug: filters.role } } : {}),
    ...statusFilter,
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

  const bucketOptions: AdminCandidateFilterOption[] = [
    { value: "", label: "All stages" },
    { value: "applied", label: "Applied" },
    { value: "screening", label: "Screening / review" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "interview", label: "In interview" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected / withdrawn" },
    { value: "hired", label: "Hired / onboarding" },
  ];

  return {
    roleOptions,
    statusOptions,
    bucketOptions,
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
