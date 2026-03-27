import { readFile } from "node:fs/promises";

import { normalizeExtractedText } from "../normalize";
import type { ExtractorContext, ResumeExtractionResult, ResumeTextExtractor } from "../types";

type MammothModule = {
  extractRawText(input: { path: string }): Promise<{ value: string }>;
};

type PdfParse = (buffer: Buffer) => Promise<{ text?: string }>;

async function importOptionalModule<T>(moduleName: string): Promise<T | null> {
  try {
    const runtimeImport = new Function(
      "moduleName",
      "return import(moduleName);",
    ) as (value: string) => Promise<T>;

    return await runtimeImport(moduleName);
  } catch {
    return null;
  }
}

async function tryExtractDocxText(absoluteFilePath: string) {
  const mammothModule = await importOptionalModule<
    MammothModule & { default?: MammothModule }
  >("mammoth");
  const mammoth = mammothModule?.extractRawText
    ? mammothModule
    : mammothModule?.default ?? null;
  if (!mammoth) {
    return null;
  }

  const result = await mammoth.extractRawText({ path: absoluteFilePath });
  return result.value;
}

async function tryExtractPdfText(absoluteFilePath: string) {
  const pdfModule = await importOptionalModule<{ default?: PdfParse } & PdfParse>("pdf-parse");
  const pdfParse =
    typeof pdfModule === "function"
      ? pdfModule
      : pdfModule?.default ?? null;
  if (!pdfParse) {
    return null;
  }

  const fileBuffer = await readFile(absoluteFilePath);
  const result = await pdfParse(fileBuffer);
  return result.text ?? "";
}

export class LibraryTextExtractor implements ResumeTextExtractor {
  supports(extension: string): extension is ExtractorContext["extension"] {
    return extension === ".pdf" || extension === ".docx";
  }

  async extract(context: ExtractorContext): Promise<ResumeExtractionResult> {
    let rawText: string | null = null;

    if (context.extension === ".docx") {
      rawText = await tryExtractDocxText(context.absoluteFilePath);
    }

    if (context.extension === ".pdf") {
      rawText = await tryExtractPdfText(context.absoluteFilePath);
    }

    if (rawText === null) {
      return {
        success: false,
        extractedText: "",
        error: "No installed parser is available for this resume type.",
      };
    }

    const normalizedText = normalizeExtractedText(rawText);
    if (!normalizedText) {
      return {
        success: false,
        extractedText: "",
        error: "Resume extraction returned no readable text.",
      };
    }

    return {
      success: true,
      extractedText: normalizedText,
      error: null,
    };
  }
}
