import type { JSX, ReactNode } from "react";

import { FieldLegend, FieldSet } from "@shared/ui/field";

export interface ProfileFormFieldsetProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function ProfileFormFieldset({
  title,
  children,
}: ProfileFormFieldsetProps): JSX.Element {
  return (
    <FieldSet className="col-span-2">
      <FieldLegend variant="label" className="text-muted-foreground">
        {title}
      </FieldLegend>

      <div className="grid grid-cols-2 gap-3">{children}</div>
    </FieldSet>
  );
}
