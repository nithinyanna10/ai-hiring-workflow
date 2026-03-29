import { MockEmailPreviewPanel } from "./mock-email-preview-panel";

/** Renders only in development — mock email slide-over. */
export function DevMockEmailMount() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  return <MockEmailPreviewPanel />;
}
