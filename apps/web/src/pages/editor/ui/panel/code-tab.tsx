import { type JSX, Suspense, lazy } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

import { useT } from "@shared/i18n";

const SourceEditor = lazy(() => import("./source-editor"));

export interface CodeTabProps {
  readonly source: string;
  readonly onSourceChange: (source: string) => void;
  readonly error: string | null;
}

export function CodeTab({
  source,
  onSourceChange,
  error,
}: CodeTabProps): JSX.Element {
  const t = useT();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="min-h-72 flex-1 overflow-hidden bg-card">
        <Suspense fallback={null}>
          <SourceEditor
            value={source}
            onChange={onSourceChange}
            label={t("editor.code.label")}
          />
        </Suspense>
      </div>

      {error !== null && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border-destructive/40 px-3 py-2 text-xs whitespace-pre-wrap text-destructive"
        >
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
