import type { JSX, ReactNode } from "react";

import { Label } from "@shared/ui/label";

export interface StandardManagerHeaderProps {
  readonly label: string;
  readonly htmlFor: string;
  /** The row of buttons that sits opposite the label. */
  readonly children?: ReactNode;
}

export function StandardManagerHeader({
  label,
  htmlFor,
  children,
}: StandardManagerHeaderProps): JSX.Element {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2">
      <Label htmlFor={htmlFor} className="text-xs uppercase">
        {label}
      </Label>

      {children}
    </div>
  );
}
