import { useCallback, useEffect, useState } from "react";

import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { useT } from "@shared/i18n";
import { getErrorMessage } from "@shared/lib/get-error-message";

import {
  copyImage,
  copySvg,
  defaultExportName,
  exportImage,
} from "../lib/export-diagram";

export type ExportAction = "download" | "copy-image" | "copy-svg";

const FEEDBACK_MS = 2000;

export interface ExportActions {
  /** The action that is running now, if any. */
  readonly busy: ExportAction | null;
  /** The copy action that finished last, briefly before resetting. */
  readonly copied: Exclude<ExportAction, "download"> | null;
  readonly failure: string | null;
  readonly run: (action: ExportAction) => Promise<void>;
}

export function useExportActions(
  source: string,
  profile: StandardProfile | undefined,
  settings: ExportSettings,
  diagramName?: string,
): ExportActions {
  const t = useT();
  const [busy, setBusy] = useState<ExportAction | null>(null);
  const [copied, setCopied] = useState<Exclude<
    ExportAction,
    "download"
  > | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (copied === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(null);
    }, FEEDBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const run = useCallback(
    async (action: ExportAction) => {
      if (profile === undefined) {
        return;
      }

      setBusy(action);
      setFailure(null);
      setCopied(null);

      try {
        switch (action) {
          case "download":
            await exportImage(
              source,
              profile,
              settings,
              defaultExportName(diagramName),
            );
            break;
          case "copy-image":
            await copyImage(source, profile, settings);
            setCopied(action);
            break;
          case "copy-svg":
            await copySvg(source, profile, settings);
            setCopied(action);
            break;
        }
      } catch (error) {
        setFailure(`${t("editor.actions.failed")}: ${getErrorMessage(error)}`);
      } finally {
        setBusy(null);
      }
    },
    [source, profile, settings, diagramName, t],
  );

  return { busy, copied, failure, run };
}
