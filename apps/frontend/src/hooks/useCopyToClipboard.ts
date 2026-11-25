"use client";

import { useState, useCallback } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        console.warn("Clipboard not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), resetDelay);
        return true;
      } catch (error) {
        console.error("Copy failed:", error);
        setIsCopied(false);
        return false;
      }
    },
    [resetDelay]
  );

  return { isCopied, copy };
}
