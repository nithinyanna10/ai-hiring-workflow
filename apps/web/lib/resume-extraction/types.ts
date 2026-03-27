export type ResumeFileReference = {
  resumeFileUrl: string;
};

export type ResumeExtractionResult = {
  success: boolean;
  extractedText: string;
  error: string | null;
};

export type ExtractorContext = {
  absoluteFilePath: string;
  extension: ".pdf" | ".docx";
};

export interface ResumeTextExtractor {
  supports(extension: string): extension is ExtractorContext["extension"];
  extract(context: ExtractorContext): Promise<ResumeExtractionResult>;
}
