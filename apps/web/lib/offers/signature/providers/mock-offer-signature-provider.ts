import { SignatureStatus } from "@prisma/client";

import { env } from "../../../env";
import type { OfferSignatureProvider } from "../provider";
import type {
  OfferSignatureCompletionInput,
  OfferSignatureCompletionResult,
  OfferSigningSessionInput,
  OfferSigningSessionResult,
} from "../types";

export class MockOfferSignatureProvider implements OfferSignatureProvider {
  readonly providerName = "mock-esign";

  async createSigningSession(
    input: OfferSigningSessionInput,
  ): Promise<OfferSigningSessionResult> {
    const callbackUrl = new URL("/offer/sign/mock-callback", env.NEXT_PUBLIC_APP_URL);
    callbackUrl.searchParams.set("signatureToken", input.signatureToken);

    return {
      providerName: this.providerName,
      signingUrl: callbackUrl.toString(),
      externalEnvelopeId: `mock-envelope-${input.offerId}`,
    };
  }

  async completeSigning(
    _input: OfferSignatureCompletionInput,
  ): Promise<OfferSignatureCompletionResult> {
    return {
      providerName: this.providerName,
      signatureStatus: SignatureStatus.SIGNED,
      completedAt: new Date(),
    };
  }
}
