"use client";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type CopyButtonProps = {
  text: string;
  styling?: string;
};

export function CopyButton({ text, styling }: CopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard();

  return (
    <button onClick={() => copy(text)} className={styling}>
      {isCopied ? "Copied!" : "Copy"}
    </button>
  );
}
