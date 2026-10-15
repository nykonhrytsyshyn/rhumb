import type { JSX } from "react";
import { useState } from "react";

import { IconBrandGithub } from "@tabler/icons-react";

import { LABEL_STYLES, type LabelStyle } from "@rhumb/engine";

import { ThemeToggler } from "@features/theme";

import { SITE } from "@shared/config";
import { LANGUAGE_OPTIONS, LanguageSwitcher, useI18n } from "@shared/i18n";
import { usePersistedState } from "@shared/lib/use-persisted-state";
import { Button } from "@shared/ui/button";

import { sampleSource, translateSample } from "../config/samples";
import type { DiagramStore, SavedDiagram } from "../model/diagram-store";
import { useProfileEditor } from "../model/use-profile-editor";
import { useRenderedDiagram } from "../model/use-rendered-diagram";
import { DiagramCanvas } from "./canvas";
import { EditorPanel } from "./panel";

const SOURCE_KEY = "rhumb:source";
const LABEL_STYLE_KEY = "rhumb:label-style";
const CURRENT_DIAGRAM_KEY = "rhumb:current-diagram";
const WIDE_SCREEN = "(min-width: 768px)";

function startsOpen(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia(WIDE_SCREEN).matches
  );
}

export interface EditorPageProps {
  /** Where saved diagrams live; the browser's storage by default. */
  readonly libraryStore?: DiagramStore;
}

export function EditorPage({ libraryStore }: EditorPageProps): JSX.Element {
  const { t, language, setLanguage } = useI18n();
  const editor = useProfileEditor();
  const [source, setSource] = usePersistedState(
    SOURCE_KEY,
    sampleSource("algorithm", language),
  );
  const [storedLabelStyle, setStoredLabelStyle] = usePersistedState(
    LABEL_STYLE_KEY,
    "beside",
  );
  const [storedCurrent, setStoredCurrent] = usePersistedState(
    CURRENT_DIAGRAM_KEY,
    "",
  );
  const [panelOpen, setPanelOpen] = useState(startsOpen);
  const [fitKey, setFitKey] = useState(0);

  const labelStyle: LabelStyle =
    LABEL_STYLES.find((candidate) => candidate === storedLabelStyle) ??
    "beside";
  const rendered = useRenderedDiagram(source, editor.active, labelStyle);

  function openDiagram(diagram: SavedDiagram): void {
    setSource(diagram.source);
    setStoredLabelStyle(diagram.labelStyle);

    if (editor.profiles.some((profile) => profile.id === diagram.profileId)) {
      editor.select(diagram.profileId);
    }

    setFitKey((key) => key + 1);
  }

  return (
    <main className="relative flex h-dvh w-full overflow-hidden">
      <h1 className="sr-only">
        {t("common.app.name")}: {t("common.app.tagline")}
      </h1>

      <EditorPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        source={source}
        onSourceChange={setSource}
        error={rendered.error}
        editor={editor}
        labelStyle={labelStyle}
        onLabelStyleChange={setStoredLabelStyle}
        {...(libraryStore === undefined ? {} : { libraryStore })}
        currentDiagramId={storedCurrent === "" ? null : storedCurrent}
        onCurrentDiagramChange={(id) => {
          setStoredCurrent(id ?? "");
        }}
        onOpenDiagram={openDiagram}
        onProfileSelect={(id) => {
          editor.select(id);
          setFitKey((key) => key + 1);
        }}
        onSampleSelect={(next) => {
          setSource(next);
          setFitKey((key) => key + 1);
        }}
      />

      <DiagramCanvas
        state={rendered}
        panelOpen={panelOpen}
        onPanelOpenChange={setPanelOpen}
        fitKey={fitKey}
        footer={
          <>
            <LanguageSwitcher
              language={language}
              onChange={(next) => {
                const translated = translateSample(source, next);

                if (translated !== undefined) {
                  setSource(translated);
                }

                setLanguage(next);
              }}
              options={LANGUAGE_OPTIONS}
              label={t("common.language.label")}
              heading={t("common.language.heading")}
            />

            <ThemeToggler
              label={t("common.theme.toggle")}
              modeLabels={{
                light: t("common.theme.mode.light"),
                dark: t("common.theme.mode.dark"),
                system: t("common.theme.mode.system"),
              }}
            />

            <Button
              variant="outline"
              title={`v${SITE.version}`}
              onClick={() => {
                window.open(
                  SITE.repositoryUrl,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              className="gap-3"
            >
              <span className="font-mono text-xs text-muted-foreground">
                v{SITE.version}
              </span>

              <IconBrandGithub />
            </Button>
          </>
        }
      />
    </main>
  );
}
