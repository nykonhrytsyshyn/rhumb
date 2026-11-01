import type { JSX } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useT } from "@shared/i18n";
import { downloadBlob } from "@shared/lib/download-blob";
import { toFileName } from "@shared/lib/to-file-name";

import { type LibraryPage, isNarrowed } from "../../../../lib/library-view";
import { sourceStats } from "../../../../lib/source-stats";
import type {
  DiagramLibrary as DiagramLibraryModel,
  SavedDiagram,
} from "../../../../model/diagram";
import { CUSTOM_PROFILE_ID, useProfiles } from "../../../../model/profile";
import type { LibrarySelection } from "../../../../model/use-library-selection";
import type { LibraryViewState } from "../../../../model/use-library-view";
import { DiagramThumbnail } from "../../../diagram";

export interface GridSectionProps {
  readonly items: readonly SavedDiagram[];
  readonly shown: LibraryPage;
  readonly state: LibraryViewState;
  readonly selection: LibrarySelection;
  readonly library: DiagramLibraryModel;
  readonly currentId: string | null;
  readonly onCurrentChange: (id: string | null) => void;
  readonly onOpen: (diagram: SavedDiagram) => void;
}

export function GridSection({
  items,
  shown,
  state,
  selection,
  library,
  currentId,
  onCurrentChange,
  onOpen,
}: GridSectionProps): JSX.Element {
  const t = useT();
  const profiles = useProfiles();

  async function duplicate(diagram: SavedDiagram): Promise<void> {
    await library.duplicate(
      diagram.id,
      t("editor.library.copyName", { name: diagram.name }),
    );
  }

  async function remove(diagram: SavedDiagram): Promise<void> {
    if ((await library.remove(diagram.id)) && diagram.id === currentId) {
      onCurrentChange(null);
    }
  }

  function standardTitle(id: string): string {
    const profile = profiles.find((item) => item.id === id);

    return id === CUSTOM_PROFILE_ID
      ? t("editor.config.custom")
      : (profile?.title ?? id);
  }

  if (library.items === undefined) {
    return <DiagramLibrary.Loading />;
  }

  if (items.length === 0) {
    return <DiagramLibrary.Empty />;
  }

  if (shown.total === 0) {
    return (
      <DiagramLibrary.NoMatches
        {...(isNarrowed(state.view) ? { onReset: state.resetAll } : {})}
      />
    );
  }

  return (
    <DiagramLibrary.Grid>
      {shown.items.map((diagram) => (
        <DiagramLibrary.Card
          key={diagram.id}
          name={diagram.name}
          updatedAt={diagram.updatedAt}
          details={{
            standard: standardTitle(diagram.profileId),
            createdAt: diagram.createdAt,
            updatedAt: diagram.updatedAt,
            ...sourceStats(diagram.source),
          }}
          current={diagram.id === currentId}
          {...(selection.active
            ? {
                selection: {
                  selected: selection.selected.has(diagram.id),
                  onSelectedChange: () => {
                    selection.toggle(diagram.id);
                  },
                },
              }
            : {})}
          thumbnail={
            <DiagramThumbnail
              source={diagram.source}
              profile={
                profiles.find((profile) => profile.id === diagram.profileId) ??
                profiles[0]
              }
            />
          }
          onOpen={() => {
            onCurrentChange(diagram.id);
            onOpen(diagram);
          }}
          onRename={(next) => {
            void library.update(diagram.id, { name: next });
          }}
          onDuplicate={() => {
            void duplicate(diagram);
          }}
          onDownload={() => {
            downloadBlob(
              new Blob([diagram.source], {
                type: "text/plain;charset=utf-8",
              }),
              `${toFileName(diagram.name)}.mmd`,
            );
          }}
          onDelete={() => {
            void remove(diagram);
          }}
        />
      ))}
    </DiagramLibrary.Grid>
  );
}
