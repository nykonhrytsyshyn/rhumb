import type { JSX } from "react";

import { IconBook, IconCode, IconSettings } from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui/tabs";

import { ActionsSection } from "./actions-section";
import { CodeTab } from "./code-tab";
import { ConfigTab } from "./config-tab";
import { DocsTab } from "./docs-tab";
import { SamplesSection } from "./samples-section";
import { useSheetGestures } from "./use-sheet-gestures";

export interface EditorPanelProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly source: string;
  readonly onSourceChange: (source: string) => void;
  readonly error: string | null;
  readonly profiles: readonly StandardProfile[];
  readonly profile: StandardProfile | undefined;
  readonly onProfileChange: (id: string) => void;
  readonly onSampleSelect: (source: string) => void;
}

export function EditorPanel({
  open,
  onOpenChange,
  source,
  onSourceChange,
  error,
  profiles,
  profile,
  onProfileChange,
  onSampleSelect,
}: EditorPanelProps): JSX.Element {
  const t = useT();
  const handle = useSheetGestures(open, onOpenChange);

  return (
    <aside
      data-open={open}
      className={cn(
        "z-30 flex flex-col overflow-hidden bg-background",
        // Phone: bottom sheet over the canvas
        "fixed inset-x-0 bottom-0 h-14 border-t transition-[height] duration-300 data-[open=true]:h-[72dvh]",
        // Wide screen: column on the left that slides shut
        "md:static md:h-full md:w-0 md:rounded-none md:border-t-0 md:border-r md:transition-[width] md:data-[open=false]:border-r-0 md:data-[open=true]:h-full md:data-[open=true]:w-1/3 md:data-[open=true]:max-w-xl md:data-[open=true]:min-w-96",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={t("common.panel.handle")}
        aria-expanded={open}
        className="flex h-14 shrink-0 touch-none flex-col items-center justify-center gap-1.5 md:hidden"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onOpenChange(!open);
          }
        }}
        {...handle}
      >
        <span className="h-1 w-10 rounded-full bg-foreground/25" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:min-w-96">
        <Tabs
          defaultValue="code"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList variant="line" className="m-2 w-auto justify-start">
            <TabsTrigger value="code" className="flex-none">
              <IconCode /> {t("common.tabs.code")}
            </TabsTrigger>

            <TabsTrigger value="config" className="flex-none">
              <IconSettings /> {t("common.tabs.config")}
            </TabsTrigger>

            <TabsTrigger value="docs" className="ml-auto flex-none">
              <IconBook /> {t("common.tabs.docs")}
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
                profiles={profiles}
                profile={profile}
                onProfileChange={onProfileChange}
              />
            </TabsContent>
            <TabsContent value="docs">
              <DocsTab />
            </TabsContent>

            {process.env.NODE_ENV === "development" && (
              <SamplesSection onSelect={onSampleSelect} />
            )}
            <ActionsSection source={source} profile={profile} />
          </div>
        </Tabs>
      </div>
    </aside>
  );
}
