import type { JSX } from "react";

import { IconAlertTriangle, IconBulb } from "@tabler/icons-react";

import { Alert } from "@shared/ui/alert";

export interface DocsCalloutProps {
  readonly tone: "tip" | "warning";
  readonly children: string;
}

export function DocsCallout({ tone, children }: DocsCalloutProps): JSX.Element {
  return (
    <Alert>
      {tone === "tip" ? (
        <IconBulb className="size-4 shrink-0" aria-hidden />
      ) : (
        <IconAlertTriangle className="size-4 shrink-0" aria-hidden />
      )}

      <span>{children}</span>
    </Alert>
  );
}
