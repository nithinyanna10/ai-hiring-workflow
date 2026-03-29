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
  /** Grouped pipeline bucket (overrides single `status` when non-empty). */
  bucket: string;
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
  /** From latest `application.screened` activity payload (if any). */
  aiRecommendation: string | null;
  aiConfidence: string | null;
  screeningThreshold: number;
  /** From latest `application.screened` payload (`decisionPath`). */
  screeningDecisionPath: string | null;
  strengths: string[];
  gaps: string[];
  schedulingSlots: Array<{
    startTime: Date;
    endTime: Date;
    slotStatus: string;
    holdExpiresAt: Date | null;
  }>;
  offerPreview: {
    excerpt: string | null;
    updatedAt: Date | null;
    signatureStatus: string | null;
  } | null;
  /** Post-parse keyword/pattern enrichment (inference), if any. */
  parseMeta: {
    enrichmentApplied: boolean;
    skillsInferred: boolean;
    companiesInferred: boolean;
    educationInferred: boolean;
    parseEnrichmentConfidence: "low" | "medium" | "high";
  } | null;
  /** From `ApplicationResearch.sourceLinksJson` — same sources research synthesis used (not live scraping). */
  researchSourceLinks: {
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
  } | null;
  interviews: Array<{
    id: string;
    transcriptText: string | null;
    feedbackSummary: string | null;
    notetakerProvider: string | null;
    completedAt: Date | null;
    slotStart: Date;
    slotEnd: Date;
  }>;
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
