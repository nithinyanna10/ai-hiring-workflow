import type {
  OfferSignatureCompletionInput,
  OfferSignatureCompletionResult,
  OfferSigningSessionInput,
  OfferSigningSessionResult,
} from "./types";

export interface OfferSignatureProvider {
  readonly providerName: string;
  createSigningSession(input: OfferSigningSessionInput): Promise<OfferSigningSessionResult>;
  completeSigning(
    input: OfferSignatureCompletionInput,
  ): Promise<OfferSignatureCompletionResult>;
}
