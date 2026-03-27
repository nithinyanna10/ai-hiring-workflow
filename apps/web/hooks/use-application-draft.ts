"use client";

import { useState } from "react";

export function useApplicationDraft() {
  const [isDirty, setIsDirty] = useState(false);

  return {
    isDirty,
    markDirty: () => setIsDirty(true),
    resetDraft: () => setIsDirty(false),
  };
}
