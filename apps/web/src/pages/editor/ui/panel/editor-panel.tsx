import {
  type CSSProperties,
  type JSX,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  IconBook,
  IconBookmarks,
  IconCode,
  IconSettings,
} from "@tabler/icons-react";

import type { LabelStyle } from "@rhumb/engine";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs";

import type { DiagramStore, SavedDiagram } from "../../model/diagram-store";
import type { ProfileEditor } from "../../model/use-profile-editor";
import { ActionsSection } from "./actions-section";
import { CodeTab } from "./code-tab";
import { ConfigTab } from "./config-tab";
import { DocsTab } from "./docs-tab";
import { LibraryTab } from "./library/library-tab";
import { SamplesSection } from "./samples-section";
import { useSheetGestures } from "./use-sheet-gestures";

export interface EditorPanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly source: string;
  readonly onSourceChange: (source: string) => void;
  readonly error: string | null;
  readonly editor: ProfileEditor;
  readonly onProfileSelect: (id: string) => void;
  readonly labelStyle: LabelStyle;
  readonly onLabelStyleChange: (style: LabelStyle) => void;
  readonly onSampleSelect: (source: string) => void;
  /** Where saved diagrams live; the browser's storage unless a test says so. */
  readonly libraryStore?: DiagramStore;
  /** The saved diagram open in the editor, if any. */
  readonly currentDiagramId: string | null;
  readonly onCurrentDiagramChange: (id: string | null) => void;
  readonly onOpenDiagram: (diagram: SavedDiagram) => void;
}

export function EditorPanel({
  open,
  onOpenChange,
  source,
  onSourceChange,
  error,
  editor,
  onProfileSelect,
  labelStyle,
  onLabelStyleChange,
  onSampleSelect,
  libraryStore,
  currentDiagramId,
  onCurrentDiagramChange,
  onOpenDiagram,
}: EditorPanelProps): JSX.Element {
  const t = useT();
  const handle = useSheetGestures(open, onOpenChange);
  const panelRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState("code");

  const tabGridTemplateColumns = ["code", "library", "docs", "config"]
    .map((value) => (value === activeTab ? "9fr" : "5fr"))
    .join(" ");

  const getTabTriggerClassName = (value: string): string =>
    cn(
      "min-w-0 justify-center px-2",
      "max-2xl:transition-[gap] max-2xl:duration-400 max-2xl:ease-in-out max-2xl:motion-reduce:transition-none 2xl:gap-1",
      "motion-reduce:transition-none 2xl:gap-1",
      activeTab === value ? "max-2xl:gap-1" : "max-2xl:gap-0",
    );

  const getTabLabelClassName = (value: string): string =>
    cn(
      "block min-w-0 truncate overflow-hidden whitespace-nowrap",
      "max-2xl:transition-[max-width,opacity] max-2xl:duration-400 max-2xl:ease-in-out max-2xl:motion-reduce:transition-none",
      "motion-reduce:transition-none",
      activeTab === value
        ? "max-2xl:max-w-32 max-2xl:opacity-100 2xl:max-w-none 2xl:opacity-100"
        : "max-2xl:max-w-0 max-2xl:opacity-0 2xl:max-w-none 2xl:opacity-100",
    );

  useEffect(() => {
    if (open) {
      return;
    }

    const panel = panelRef.current;
    const focusedElement = document.activeElement;

    if (
      panel !== null &&
      focusedElement instanceof HTMLElement &&
      panel.contains(focusedElement)
    ) {
      focusedElement.blur();
    }
  }, [open]);

  return (
    <aside
      ref={panelRef}
      data-open={open}
      className={cn(
        "z-30 flex shrink-0 flex-col overflow-hidden bg-background",

        // Mobile: fixed height, reveal the panel by translating it.
        "fixed inset-x-0 bottom-0 h-[72dvh] border-t",
        "translate-y-[calc(100%-2.5rem)]",
        "transition-transform duration-300 ease-out",
        "data-[open=true]:translate-y-0",
        "motion-reduce:transition-none",

        // Desktop: static height, reveal the panel by changing its width.
        "md:static md:h-full md:w-0 md:translate-y-0",
        "md:rounded-none md:border-t-0 md:border-r",
        "md:transition-[width] md:duration-300 md:ease-out",
        "md:data-[open=false]:border-r-0",
        "md:data-[open=true]:h-full",
        "md:data-[open=true]:w-1/3",
        "md:data-[open=true]:max-w-xl",
        "md:motion-reduce:transition-none",
      )}
    >
      {/* Handle for mobile bottom sheet */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t("common.panel.handle")}
        aria-expanded={open}
        className="flex h-10 shrink-0 touch-none flex-col items-center justify-center gap-1.5 p-4 md:hidden"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onOpenChange(!open);
          }
        }}
        {...handle}
      >
        <span className="h-1 w-10 rounded-full bg-foreground/25" />
      </div>

      {/* Panel content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:w-[min(33.333vw,36rem)] md:shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList
            variant="line"
            className={cn(
              "grid h-12 w-full grid-cols-4 max-md:border-t",
              "max-2xl:grid-cols-(--tab-grid-template-columns)",
              "max-2xl:transition-[grid-template-columns] max-2xl:duration-400 max-2xl:ease-in-out",
              "max-2xl:motion-reduce:transition-none",
            )}
            style={
              {
                "--tab-grid-template-columns": tabGridTemplateColumns,
              } as CSSProperties
            }
          >
            <TabsTrigger
              value="code"
              className={getTabTriggerClassName("code")}
            >
              <IconCode className="shrink-0" />
              <span className={getTabLabelClassName("code")}>
                {t("common.tabs.code")}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="library"
              className={getTabTriggerClassName("library")}
            >
              <IconBookmarks className="shrink-0" />
              <span className={getTabLabelClassName("library")}>
                {t("common.tabs.library")}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="docs"
              className={getTabTriggerClassName("docs")}
            >
              <IconBook className="shrink-0" />
              <span className={getTabLabelClassName("docs")}>
                {t("common.tabs.docs")}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="config"
              className={getTabTriggerClassName("config")}
            >
              <IconSettings className="shrink-0" />
              <span className={getTabLabelClassName("config")}>
                {t("common.tabs.config")}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-t">
            <TabsContent value="code" className="flex min-h-0 flex-1 flex-col">
              <CodeTab
                source={source}
                onSourceChange={onSourceChange}
                error={error}
              />
            </TabsContent>

            <TabsContent value="config">
              <ConfigTab
                editor={editor}
                onProfileSelect={onProfileSelect}
                labelStyle={labelStyle}
                onLabelStyleChange={onLabelStyleChange}
              />
            </TabsContent>

            <TabsContent value="library">
              <LibraryTab
                {...(libraryStore === undefined ? {} : { store: libraryStore })}
                source={source}
                labelStyle={labelStyle}
                profileId={editor.selected.id}
                currentId={currentDiagramId}
                onCurrentChange={onCurrentDiagramChange}
                onOpen={onOpenDiagram}
              />
            </TabsContent>

            <TabsContent value="docs">
              <DocsTab />
            </TabsContent>

            {process.env.NODE_ENV === "development" && (
              <SamplesSection onSelect={onSampleSelect} />
            )}

            <ActionsSection
              source={source}
              profile={editor.active}
              labelStyle={labelStyle}
            />
          </div>
        </Tabs>
      </div>
    </aside>
  );
}
