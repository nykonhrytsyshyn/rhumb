import type { CSSProperties, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { TabsList } from "@shared/ui/tabs";

import { useEditorPanel } from "../model";
import { EditorPanelTab, type EditorPanelTabProps } from "./editor-panel-tab";

export interface EditorPanelTabsProps {
  readonly tabs: readonly EditorPanelTabProps[];
}

export function EditorPanelTabs({ tabs }: EditorPanelTabsProps): JSX.Element {
  const { activeTab } = useEditorPanel();

  const narrowColumns = tabs
    .map((tab) => (tab.value === activeTab ? "9fr" : "5fr"))
    .join(" ");

  return (
    <TabsList
      variant="line"
      className={cn(
        "grid h-12 w-full grid-cols-(--tab-columns) max-md:border-t",
        "max-2xl:grid-cols-(--tab-grid-template-columns)",
        "max-2xl:transition-[grid-template-columns] max-2xl:duration-400 max-2xl:ease-in-out",
        "max-2xl:motion-reduce:transition-none",
      )}
      style={
        {
          "--tab-columns": `repeat(${String(tabs.length)}, minmax(0, 1fr))`,
          "--tab-grid-template-columns": narrowColumns,
        } as CSSProperties
      }
    >
      {tabs.map((tab) => (
        <EditorPanelTab key={tab.value} {...tab} />
      ))}
    </TabsList>
  );
}
