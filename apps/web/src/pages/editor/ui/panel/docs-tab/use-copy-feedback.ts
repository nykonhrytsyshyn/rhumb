import { useCallback, useEffect, useState } from "react";

import { copyText } from "@shared/lib/copy-text";

const FEEDBACK_MS = 1500;

export function useCopyFeedback(): {
  readonly copied: boolean;
  readonly copy: (text: string) => void;
} {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, FEEDBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const copy = useCallback((text: string) => {
    copyText(text)
      .then(() => {
        setCopied(true);
      })
      .catch(() => {
        setCopied(false);
      });
  }, []);

  return { copied, copy };
}
