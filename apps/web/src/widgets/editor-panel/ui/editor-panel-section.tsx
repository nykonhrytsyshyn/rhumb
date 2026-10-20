import type { JSX, ReactNode } from "react";

import { IconChevronDown } from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shared/ui/collapsible";

export interface EditorPanelSectionProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function EditorPanelSection({
  icon,
  title,
  defaultOpen = false,
  children,
}: EditorPanelSectionProps): JSX.Element {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="group/section z-40 border-t bg-background"
    >
      <CollapsibleTrigger className="flex w-full items-center gap-2 p-5 text-sm font-medium [&_svg]:size-4">
        {icon}
        <span className="flex-1 text-left">{title}</span>
        <IconChevronDown className="transition-transform group-data-open/section:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-5">{children}</CollapsibleContent>
    </Collapsible>
  );
}
