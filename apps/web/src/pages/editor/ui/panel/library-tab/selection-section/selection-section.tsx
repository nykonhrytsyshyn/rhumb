import { type JSX, useState } from "react";

import { IconDownload, IconTrash } from "@tabler/icons-react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useT } from "@shared/i18n";
import { downloadBlob } from "@shared/lib/download-blob";

import { zipDiagrams } from "../../../../lib/library-export";
import type {
  DiagramLibrary as DiagramLibraryModel,
  SavedDiagram,
} from "../../../../model/diagram";
import type { LibrarySelection } from "../../../../model/use-library-selection";

export interface SelectionSectionProps {
  readonly items: readonly SavedDiagram[];
  readonly matchingIds: readonly string[];
  readonly selection: LibrarySelection;
  readonly currentId: string | null;
  readonly library: DiagramLibraryModel;
  readonly onCurrentChange: (id: string | null) => void;
}

export function SelectionSection({
  items,
  matchingIds,
  selection,
  currentId,
  library,
  onCurrentChange,
}: SelectionSectionProps): JSX.Element {
  const t = useT();
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);

  const selectedCount = selection.selected.size;
  const allMatchingSelected =
    matchingIds.length > 0 &&
    matchingIds.every((id) => selection.selected.has(id));

  async function removeSelected(): Promise<void> {
    const removed = await library.removeMany([...selection.selected]);

    if (currentId !== null && removed.includes(currentId)) {
      onCurrentChange(null);
    }

    selection.clear();
  }

  function downloadSelected(): void {
    const chosen = items.filter((item) => selection.selected.has(item.id));

    if (chosen.length === 0) {
      return;
    }

    downloadBlob(
      new Blob([new Uint8Array(zipDiagrams(chosen))], {
        type: "application/zip",
      }),
      "rhumb-diagrams.zip",
    );
  }

  return (
    <>
      {selection.active ? (
        <DiagramLibrary.SelectionBar
          count={selectedCount}
          total={matchingIds.length}
          allSelected={allMatchingSelected}
          onToggleAll={(selected) => {
            if (selected) {
              selection.select(matchingIds);
            } else {
              selection.clear();
            }
          }}
          onClear={selection.clear}
        >
          <DiagramLibrary.SelectionAction
            label={t("editor.library.select.download")}
            disabled={selectedCount === 0}
            onClick={downloadSelected}
          >
            <IconDownload />
          </DiagramLibrary.SelectionAction>

          <DiagramLibrary.SelectionAction
            label={t("editor.library.select.delete")}
            destructive
            disabled={selectedCount === 0}
            onClick={() => {
              setConfirmingBulkDelete(true);
            }}
          >
            <IconTrash />
          </DiagramLibrary.SelectionAction>
        </DiagramLibrary.SelectionBar>
      ) : null}

      <DiagramLibrary.BulkDeleteDialog
        count={selectedCount}
        open={confirmingBulkDelete}
        onOpenChange={setConfirmingBulkDelete}
        onConfirm={() => {
          void removeSelected();
        }}
      />
    </>
  );
}
