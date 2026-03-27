export type RouteParams<T extends Record<string, string>> = {
  params: Promise<T>;
};

export type PageSearchParams<T extends Record<string, string | string[] | undefined>> = {
  searchParams: Promise<T>;
};

export type PublicJobSummary = {
  id: string;
  slug: string;
  title: string;
  team: string;
  location: string;
  workModel: string;
  level: string;
  description: string;
};

export type PublicJobDetail = PublicJobSummary & {
  responsibilities: string[];
  requirements: string[];
};

export type ApplyJobOption = {
  id: string;
  slug: string;
  title: string;
  location: string;
  workModel: string;
};

export type AdminCandidateListItem = {
  applicationId: string;
  candidateName: string;
  roleTitle: string;
  roleSlug: string;
  submittedAt: Date;
  aiScore: number | null;
  currentStatus: string;
};

export type AdminCandidateFilters = {
  role: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

export type AdminCandidateFilterOption = {
  label: string;
  value: string;
};

export type AdminCandidateStatusHistoryItem = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actorType: string;
  note: string | null;
  createdAt: Date;
};

export type AdminCandidateActivityItem = {
  id: string;
  eventType: string;
  actorType: string;
  note: string | null;
  payloadJson: unknown;
  createdAt: Date;
};

export type AdminCandidateDetail = {
  applicationId: string;
  currentStatus: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  resumeFileUrl: string;
  researchSummary: string | null;
  parsedResumeJson: unknown;
  aiScore: number | null;
  aiSummary: string | null;
  strengths: string[];
  gaps: string[];
  candidate: {
    fullName: string;
    email: string;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    phone: string | null;
  };
  job: {
    title: string;
    slug: string;
    team: string;
    location: string;
    workModel: string;
    level: string;
  };
  statusHistory: AdminCandidateStatusHistoryItem[];
  activityLog: AdminCandidateActivityItem[];
};
