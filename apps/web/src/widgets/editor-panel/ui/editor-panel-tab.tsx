import type { ComponentType, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { TabsTrigger } from "@shared/ui/tabs";

import { useEditorPanel } from "../model";

export interface EditorPanelTabProps {
  readonly value: string;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
}

export function EditorPanelTab({
  value,
  label,
  icon: Icon,
}: EditorPanelTabProps): JSX.Element {
  const { activeTab } = useEditorPanel();
  const active = activeTab === value;

  return (
    <TabsTrigger
      value={value}
      className={cn(
        "min-w-0 justify-center px-2",
        "max-2xl:transition-[gap] max-2xl:duration-400 max-2xl:ease-in-out max-2xl:motion-reduce:transition-none 2xl:gap-1",
        "motion-reduce:transition-none 2xl:gap-1",
        active ? "max-2xl:gap-1" : "max-2xl:gap-0",
      )}
    >
      <Icon className="shrink-0" />
      <span
        className={cn(
          "block min-w-0 truncate overflow-hidden whitespace-nowrap",
          "max-2xl:transition-[max-width,opacity] max-2xl:duration-400 max-2xl:ease-in-out max-2xl:motion-reduce:transition-none",
          "motion-reduce:transition-none",
          active
            ? "max-2xl:max-w-32 max-2xl:opacity-100 2xl:max-w-none 2xl:opacity-100"
            : "max-2xl:max-w-0 max-2xl:opacity-0 2xl:max-w-none 2xl:opacity-100",
        )}
      >
        {label}
      </span>
    </TabsTrigger>
  );
}
