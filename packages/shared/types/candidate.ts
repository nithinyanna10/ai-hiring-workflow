export type CandidateStatus = "applied" | "screening" | "interview" | "offer";

export type CandidateProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobId: string;
  status: CandidateStatus;
};
