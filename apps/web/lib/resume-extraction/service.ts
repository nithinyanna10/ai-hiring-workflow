import { MockTextExtractor } from "./extractors/mock-text-extractor";
import { LibraryTextExtractor } from "./extractors/library-text-extractor";
import { resolveResumeFileReference } from "./file";
import type { ResumeExtractionResult, ResumeFileReference, ResumeTextExtractor } from "./types";

const extractors: ResumeTextExtractor[] = [
  new LibraryTextExtractor(),
  new MockTextExtractor(),
];

export async function extractResumeText(
  reference: ResumeFileReference,
): Promise<ResumeExtractionResult> {
  try {
    const context = await resolveResumeFileReference(reference);
    const supportedExtractors = extractors.filter((candidate) =>
      candidate.supports(context.extension),
    );

    if (supportedExtractors.length === 0) {
      return {
        success: false,
        extractedText: "",
        error: `Unsupported resume file type: ${context.extension}`,
      };
    }

    let lastFailure: ResumeExtractionResult | null = null;
    for (const extractor of supportedExtractors) {
      const result = await extractor.extract(context);
      if (result.success) {
        return result;
      }

      lastFailure = result;
    }

    return (
      lastFailure ?? {
        success: false,
        extractedText: "",
        error: "Resume extraction failed.",
      }
    );
  } catch (error) {
    return {
      success: false,
      extractedText: "",
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error while extracting resume text.",
    };
  }
}
