import type { JSX } from "react";

import { IconAlertTriangle, IconBulb } from "@tabler/icons-react";

export interface DocsCalloutProps {
  readonly tone: "tip" | "warning";
  readonly children: string;
}

export function DocsCallout({ tone, children }: DocsCalloutProps): JSX.Element {
  return (
    <div className="flex items-start gap-2 rounded-xl border bg-muted/50 p-3 text-xs">
      {tone === "tip" ? (
        <IconBulb className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <IconAlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}

      <span>{children}</span>
    </div>
  );
}
