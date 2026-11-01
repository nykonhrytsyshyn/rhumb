import { type JSX, useState } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import type {
  DiagramLibrary as DiagramLibraryModel,
  SavedDiagram,
} from "../../../../model/diagram";
import { LibraryUpdateDialog } from "./library-update-dialog";

export interface SaveSectionProps {
  readonly source: string;
  readonly profileId: string;
  readonly current: SavedDiagram | undefined;
  readonly library: DiagramLibraryModel;
  readonly standardTitle: (profileId: string) => string;
  readonly onCurrentChange: (id: string | null) => void;
}

export function SaveSection({
  source,
  profileId,
  current,
  library,
  standardTitle,
  onCurrentChange,
}: SaveSectionProps): JSX.Element {
  const t = useT();
  const [name, setName] = useState("");
  const [confirmingUpdate, setConfirmingUpdate] = useState(false);

  async function saveAsNew(): Promise<void> {
    const trimmed = name.trim();
    const created = await library.create({
      name: trimmed === "" ? t("editor.library.untitled") : trimmed,
      source,
      profileId,
    });

    if (created !== undefined) {
      setName("");
      onCurrentChange(created.id);
    }
  }

  return (
    <>
      <DiagramLibrary.SaveForm
        name={name}
        onNameChange={setName}
        onSubmit={() => {
          void saveAsNew();
        }}
        disabled={source.trim() === ""}
      >
        {current === undefined ? null : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmingUpdate(true);
            }}
          >
            {t("editor.library.update", { name: current.name })}
          </Button>
        )}
      </DiagramLibrary.SaveForm>

      {library.error === null ? null : (
        <DiagramLibrary.Error message={library.error} />
      )}

      {current === undefined ? null : (
        <LibraryUpdateDialog
          saved={current}
          source={source}
          profileId={profileId}
          open={confirmingUpdate}
          onOpenChange={setConfirmingUpdate}
          onConfirm={() => {
            void library.update(current.id, { source, profileId });
          }}
          standardTitle={standardTitle}
        />
      )}
    </>
  );
}
