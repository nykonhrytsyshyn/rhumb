import type { JSX } from "react";

import { DiagramCanvas } from "@widgets/diagram-canvas";
import { EditorPanel } from "@widgets/editor-panel";

import { LanguageSwitcher } from "@features/i18n";
import { ThemeToggler } from "@features/theme";

import { useT } from "@shared/i18n";

import { EDITOR_TABS } from "../config/editor-tabs";
import { useDeveloperMode } from "../model/use-developer-mode";
import { useEditorPage } from "../model/use-editor-page";
import { RepositoryButton } from "./diagram";
import {
  ActionsSection,
  CodeTab,
  ConfigTab,
  DocsTab,
  LibraryTab,
  SamplesSection,
} from "./panel";

export function EditorPage(): JSX.Element {
  const t = useT();
  const page = useEditorPage();
  const developer = useDeveloperMode();

  const tabs = EDITOR_TABS.map((tab) => ({
    value: tab.value,
    label: t(tab.labelKey),
    icon: tab.icon,
  }));

  return (
    <main className="relative flex h-dvh w-full overflow-hidden">
      <h1 className="sr-only">
        {t("common.app.name")}: {t("common.app.tagline")}
      </h1>

      <EditorPanel
        open={page.panelOpen}
        onOpenChange={page.setPanelOpen}
        defaultTab="code"
      >
        <EditorPanel.Handle />

        <EditorPanel.Body>
          <EditorPanel.Tabs tabs={tabs} />

          <EditorPanel.Content>
            <EditorPanel.Pane value="code" fill>
              <CodeTab
                source={page.source}
                onSourceChange={page.setSource}
                error={page.rendered.error}
              />
            </EditorPanel.Pane>

            <EditorPanel.Pane value="config">
              <ConfigTab
                editor={page.editor}
                onProfileSelect={page.selectProfile}
                developer={developer}
              />
            </EditorPanel.Pane>

            <EditorPanel.Pane value="library">
              <LibraryTab
                source={page.source}
                profileId={page.editor.selected.id}
                currentId={page.currentDiagramId}
                onCurrentChange={page.setCurrentDiagramId}
                onOpen={page.openDiagram}
              />
            </EditorPanel.Pane>

            <EditorPanel.Pane value="docs">
              <DocsTab />
            </EditorPanel.Pane>

            {developer.enabled && (
              <SamplesSection onSelect={page.selectSample} />
            )}

            <ActionsSection source={page.source} profile={page.editor.active} />
          </EditorPanel.Content>
        </EditorPanel.Body>
      </EditorPanel>

      <DiagramCanvas state={page.rendered} fitKey={page.fitKey}>
        <DiagramCanvas.Viewport />
        <DiagramCanvas.Empty />

        <DiagramCanvas.Slot position="top-left">
          <EditorPanel.Toggle
            open={page.panelOpen}
            onOpenChange={page.setPanelOpen}
          />
        </DiagramCanvas.Slot>

        <DiagramCanvas.Slot position="top-right">
          <DiagramCanvas.Toolbar />
        </DiagramCanvas.Slot>

        <DiagramCanvas.Alert />

        <DiagramCanvas.Slot position="bottom-left">
          <DiagramCanvas.GridToggle />
          <DiagramCanvas.PendingBadge />
        </DiagramCanvas.Slot>

        <DiagramCanvas.Slot position="bottom-right">
          <LanguageSwitcher onChange={page.followLanguage} />
          <ThemeToggler />
          <RepositoryButton />
        </DiagramCanvas.Slot>
      </DiagramCanvas>
    </main>
  );
}
