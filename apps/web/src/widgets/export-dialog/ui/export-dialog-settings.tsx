import type { JSX, ReactNode } from "react";

import { FieldGroup } from "@shared/ui/field";

export interface ExportDialogSettingsProps {
  readonly children: ReactNode;
}

export function ExportDialogSettings({
  children,
}: ExportDialogSettingsProps): JSX.Element {
  return (
    <div className="shrink-0 md:w-90 md:overflow-y-auto md:border-l">
      <FieldGroup className="gap-4 p-4">{children}</FieldGroup>
    </div>
  );
}
