import { useEffect } from "react";

const DEFAULT_DOCUMENT_TITLE = "TypeType";

function toDocumentTitle(title: string | null | undefined): string {
  const trimmed = title?.trim();
  return trimmed ? `${trimmed} - ${DEFAULT_DOCUMENT_TITLE}` : DEFAULT_DOCUMENT_TITLE;
}

export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    document.title = toDocumentTitle(title);
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [title]);
}
