import type { JSX, ReactNode } from "react";

import { FieldLegend, FieldSet } from "@shared/ui/field";

export interface ExportDialogSectionProps {
  readonly title: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

export function ExportDialogSection({
  title,
  hint,
  children,
}: ExportDialogSectionProps): JSX.Element {
  return (
    <FieldSet className="gap-3">
      <FieldLegend
        variant="label"
        className="flex w-full items-baseline justify-between gap-2"
      >
        <span>{title}</span>

        {hint === undefined ? null : (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </FieldLegend>

      {children}
    </FieldSet>
  );
}
