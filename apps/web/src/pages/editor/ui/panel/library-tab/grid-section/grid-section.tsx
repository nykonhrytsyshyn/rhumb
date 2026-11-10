import type { JSX } from "react";

import type { StandardProfile } from "@rhumb/profiles";

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
import type { LibrarySelection } from "../../../../model/use-library-selection";
import type { LibraryViewState } from "../../../../model/use-library-view";
import { DiagramThumbnail } from "../../../diagram";

export interface GridSectionProps {
  readonly items: readonly SavedDiagram[];
  readonly shown: LibraryPage;
  readonly state: LibraryViewState;
  readonly selection: LibrarySelection;
  readonly library: DiagramLibraryModel;
  readonly profiles: readonly StandardProfile[];
  readonly standardTitle: (profileId: string) => string;
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
  profiles,
  standardTitle,
  currentId,
  onCurrentChange,
  onOpen,
}: GridSectionProps): JSX.Element {
  const t = useT();

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
              `${toFileName(diagram.name)}.md`,
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
