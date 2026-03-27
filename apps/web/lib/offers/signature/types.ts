import type { SignatureStatus } from "@prisma/client";

export type OfferSigningSessionInput = {
  signatureToken: string;
  offerId: string;
  applicationId: string;
  candidateName: string;
  roleTitle: string;
};

export type OfferSigningSessionResult = {
  providerName: string;
  signingUrl: string;
  externalEnvelopeId?: string;
};

export type OfferSignatureCompletionInput = {
  signatureToken: string;
  signerIp: string | null;
};

export type OfferSignatureCompletionResult = {
  providerName: string;
  signatureStatus: SignatureStatus;
  completedAt: Date | null;
};

export type OfferReviewDetail = {
  applicationId: string;
  candidateName: string;
  roleTitle: string;
  startDate: Date | null;
  baseSalary: string | null;
  equity: string | null;
  bonus: string | null;
  managerName: string | null;
  customTerms: string | null;
  offerText: string | null;
  signatureStatus: SignatureStatus;
  signatureProvider: string | null;
  signedAt: Date | null;
};
