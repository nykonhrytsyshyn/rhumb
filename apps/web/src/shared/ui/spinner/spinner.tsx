import type { JSX, SVGProps } from "react";

import { IconLoader } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type SpinnerProps = SVGProps<SVGSVGElement>;

export function Spinner({ className, ...props }: SpinnerProps): JSX.Element {
  return (
    <IconLoader
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}
