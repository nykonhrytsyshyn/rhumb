import type { JSX } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

import { SourceEditor } from "@widgets/source-editor";

import { useT } from "@shared/i18n";
import { Alert } from "@shared/ui/alert";

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-hidden bg-card">
        <SourceEditor
          value={source}
          onChange={onSourceChange}
          label={t("editor.code.label")}
        />
      </div>

      {error !== null && (
        <Alert variant="banner">
          <IconAlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}
    </div>
  );
}
