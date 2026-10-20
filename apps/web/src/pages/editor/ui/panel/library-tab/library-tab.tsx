import { type JSX, useState } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useI18n } from "@shared/i18n";
import { downloadBlob } from "@shared/lib/download-blob";
import { toFileName } from "@shared/lib/to-file-name";
import { Button } from "@shared/ui/button";

import type { SavedDiagram } from "../../../model/diagram/is-saved-diagram";
import { useDiagramLibrary } from "../../../model/diagram/use-diagram-library";
import { useProfiles } from "../../../model/profile/use-profiles";
import { DiagramThumbnail } from "../../diagram/diagram-thumbnail";

export interface LibraryTabProps {
  readonly source: string;
  readonly profileId: string;
  readonly currentId: string | null;
  readonly onCurrentChange: (id: string | null) => void;
  readonly onOpen: (diagram: SavedDiagram) => void;
}

export function LibraryTab({
  source,
  profileId,
  currentId,
  onCurrentChange,
  onOpen,
}: LibraryTabProps): JSX.Element {
  const { t } = useI18n();
  const profiles = useProfiles();
  const library = useDiagramLibrary();
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const items = library.items ?? [];
  const current = items.find((item) => item.id === currentId);
  const needle = query.trim().toLowerCase();
  const visible = items.filter((item) =>
    item.name.toLowerCase().includes(needle),
  );

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

  return (
    <DiagramLibrary>
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
              void library.update(current.id, {
                source,
                profileId,
              });
            }}
          >
            {t("editor.library.update", { name: current.name })}
          </Button>
        )}
      </DiagramLibrary.SaveForm>

      {library.error === null ? null : (
        <DiagramLibrary.Error message={library.error} />
      )}

      <DiagramLibrary.Search value={query} onChange={setQuery} />

      {library.items === undefined ? <DiagramLibrary.Loading /> : null}

      {library.items !== undefined && items.length === 0 ? (
        <DiagramLibrary.Empty />
      ) : null}

      {items.length > 0 && visible.length === 0 ? (
        <DiagramLibrary.NoMatches />
      ) : null}

      <DiagramLibrary.Grid>
        {visible.map((diagram) => (
          <DiagramLibrary.Card
            key={diagram.id}
            name={diagram.name}
            updatedAt={diagram.updatedAt}
            current={diagram.id === currentId}
            thumbnail={
              <DiagramThumbnail
                source={diagram.source}
                profile={
                  profiles.find(
                    (profile) => profile.id === diagram.profileId,
                  ) ?? profiles[0]
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
    </DiagramLibrary>
  );
}
