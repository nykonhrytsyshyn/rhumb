import type { JSX, ReactNode } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/accordion";

export interface ProfileFormGroupProps {
  readonly id: string;
  readonly title: string;
  readonly invalid: boolean;
  readonly children: ReactNode;
}

export function ProfileFormGroup({
  id,
  title,
  invalid,
  children,
}: ProfileFormGroupProps): JSX.Element {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <span className="flex items-center gap-2">
          {title}
          {invalid ? (
            <span
              role="img"
              aria-label="!"
              className="size-2 rounded-full bg-destructive"
            />
          ) : null}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
