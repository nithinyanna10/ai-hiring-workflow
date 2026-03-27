import { readFile } from "node:fs/promises";

import { normalizeExtractedText } from "../normalize";
import type { ExtractorContext, ResumeExtractionResult, ResumeTextExtractor } from "../types";

function decodePrintableText(buffer: Buffer) {
  return buffer
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ");
}

export class MockTextExtractor implements ResumeTextExtractor {
  supports(extension: string): extension is ExtractorContext["extension"] {
    return extension === ".pdf" || extension === ".docx";
  }

  async extract(context: ExtractorContext): Promise<ResumeExtractionResult> {
    const fileBuffer = await readFile(context.absoluteFilePath);
    const decodedText = normalizeExtractedText(decodePrintableText(fileBuffer));

    if (!decodedText) {
      return {
        success: false,
        extractedText: "",
        error: "Resume extraction returned no readable text.",
      };
    }

    return {
      success: true,
      extractedText: decodedText,
      error: null,
    };
  }
}
