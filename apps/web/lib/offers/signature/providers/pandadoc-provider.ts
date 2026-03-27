import type { OfferSignatureProvider } from "../provider";
import type {
  OfferSignatureCompletionInput,
  OfferSignatureCompletionResult,
  OfferSigningSessionInput,
  OfferSigningSessionResult,
} from "../types";

export class PandaDocProvider implements OfferSignatureProvider {
  readonly providerName = "pandadoc";

  async createSigningSession(
    _input: OfferSigningSessionInput,
  ): Promise<OfferSigningSessionResult> {
    throw new Error("PandaDoc signing is not implemented yet.");
  }

  async completeSigning(
    _input: OfferSignatureCompletionInput,
  ): Promise<OfferSignatureCompletionResult> {
    throw new Error("PandaDoc signature callbacks are not implemented yet.");
  }
}
