import { useState } from "react";

import { type Language, useI18n } from "@shared/i18n";
import { usePersistedState } from "@shared/lib/use-persisted-state";

import { CURRENT_DIAGRAM_KEY, SOURCE_KEY } from "../config/storage-keys";
import { isWideScreen } from "../lib/is-wide-screen";
import { sampleSource } from "../lib/sample-source";
import { translateSample } from "../lib/translate-sample";
import {
  type DiagramLibrary,
  type RenderState,
  type SavedDiagram,
  useDiagramLibrary,
  useRenderedDiagram,
} from "./diagram";
import {
  type ProfileEditor,
  useProfileEditor,
} from "./profile/use-profile-editor";

export interface EditorPageModel {
  readonly editor: ProfileEditor;
  readonly library: DiagramLibrary;
  readonly source: string;
  readonly setSource: (source: string) => void;
  readonly rendered: RenderState;
  readonly panelOpen: boolean;
  readonly setPanelOpen: (open: boolean) => void;
  readonly fitKey: number;
  readonly currentDiagramId: string | null;
  readonly currentDiagramName: string | undefined;
  readonly setCurrentDiagramId: (id: string | null) => void;
  readonly openDiagram: (diagram: SavedDiagram) => void;
  readonly selectProfile: (id: string) => void;
  readonly selectSample: (source: string) => void;
  readonly followLanguage: (language: Language) => void;
}

export function useEditorPage(): EditorPageModel {
  const { language } = useI18n();
  const editor = useProfileEditor();
  const library = useDiagramLibrary();
  const [source, setSource] = usePersistedState(
    SOURCE_KEY,
    sampleSource("algorithm", language),
  );
  const [storedCurrent, setStoredCurrent] = usePersistedState(
    CURRENT_DIAGRAM_KEY,
    "",
  );
  const [panelOpen, setPanelOpen] = useState(isWideScreen);
  const [fitKey, setFitKey] = useState(0);

  const rendered = useRenderedDiagram(source, editor.active);
  const currentDiagramId = storedCurrent === "" ? null : storedCurrent;
  const currentDiagramName = library.items?.find(
    (item) => item.id === currentDiagramId,
  )?.name;

  function refit(): void {
    setFitKey((key) => key + 1);
  }

  return {
    editor,
    library,
    source,
    setSource,
    rendered,
    panelOpen,
    setPanelOpen,
    fitKey,
    currentDiagramId,
    currentDiagramName,
    setCurrentDiagramId: (id) => {
      setStoredCurrent(id ?? "");
    },
    openDiagram: (diagram) => {
      setSource(diagram.source);

      if (editor.profiles.some((profile) => profile.id === diagram.profileId)) {
        editor.select(diagram.profileId);
      }

      refit();
    },
    selectProfile: (id) => {
      editor.select(id);
      refit();
    },
    selectSample: (next) => {
      setSource(next);
      refit();
    },
    followLanguage: (next) => {
      const translated = translateSample(source, next);

      if (translated !== undefined) {
        setSource(translated);
      }
    },
  };
}
