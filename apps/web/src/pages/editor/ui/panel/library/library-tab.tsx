import { type JSX, useState } from "react";

import { IconDeviceFloppy, IconSearch } from "@tabler/icons-react";

import type { LabelStyle } from "@rhumb/engine";

import { useI18n } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

import { downloadBlob } from "../../../lib/download";
import { toFileName } from "../../../lib/file-name";
import {
  type DiagramStore,
  type SavedDiagram,
  diagramStore,
} from "../../../model/diagram-store";
import { useDiagramLibrary } from "../../../model/use-diagram-library";
import { useProfiles } from "../../../model/use-profiles";
import { LibraryCard } from "./library-card";

export interface LibraryTabProps {
  /** Where diagrams are kept; the browser's own storage by default. */
  readonly store?: DiagramStore;
  readonly source: string;
  readonly labelStyle: LabelStyle;
  readonly profileId: string;
  /** The saved diagram that is open in the editor, if any. */
  readonly currentId: string | null;
  readonly onCurrentChange: (id: string | null) => void;
  readonly onOpen: (diagram: SavedDiagram) => void;
}

export function LibraryTab({
  store = diagramStore,
  source,
  labelStyle,
  profileId,
  currentId,
  onCurrentChange,
  onOpen,
}: LibraryTabProps): JSX.Element {
  const { t } = useI18n();
  const profiles = useProfiles();
  const library = useDiagramLibrary(store);
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
      labelStyle,
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
    <div className="flex flex-col">
      <form
        className="flex flex-col gap-3 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void saveAsNew();
        }}
      >
        <div className="flex h-10 rounded-2xl bg-input/50">
          <Input
            className="h-full border-none bg-transparent pl-4 focus-visible:border-transparent focus-visible:ring-0"
            aria-label={t("editor.library.nameLabel")}
            placeholder={t("editor.library.namePlaceholder")}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />

          <Button
            type="submit"
            className="h-full w-[40%] shrink-0 rounded-2xl"
            disabled={source.trim() === ""}
          >
            <IconDeviceFloppy />
            <span className="truncate">{t("editor.library.saveNew")}</span>
          </Button>
        </div>

        {current === undefined ? null : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void library.update(current.id, {
                source,
                profileId,
                labelStyle,
              });
            }}
          >
            {t("editor.library.update", { name: current.name })}
          </Button>
        )}
      </form>

      {/* Error message if the library failed to load or save */}
      {library.error === null ? null : (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/40 px-3 py-2 font-mono text-xs whitespace-pre-wrap text-destructive"
        >
          {t("editor.library.storageFailed")}
          {"\n"}
          {library.error}
        </p>
      )}

      {/* Search bar */}
      {items.length > 0 ? (
        <div className="relative border-y">
          <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("editor.library.search")}
            placeholder={t("editor.library.search")}
            className="h-12 rounded-none bg-transparent pl-11 focus-visible:border-transparent focus-visible:bg-input/50 focus-visible:ring-0"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        </div>
      ) : null}

      {/* Message for loading library */}
      {library.items === undefined ? (
        <p className="border-t p-4 text-sm text-muted-foreground">
          {t("editor.library.loading")}
        </p>
      ) : null}

      {/* Message for empty library */}
      {library.items !== undefined && items.length === 0 ? (
        <p className="border-t p-4 text-sm text-muted-foreground">
          {t("editor.library.empty")}
        </p>
      ) : null}

      {/* Message for no matches found */}
      {items.length > 0 && visible.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {t("editor.library.noMatches")}
        </p>
      ) : null}

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
        {visible.map((diagram) => (
          <LibraryCard
            key={diagram.id}
            diagram={diagram}
            profile={
              profiles.find((profile) => profile.id === diagram.profileId) ??
              profiles[0]
            }
            current={diagram.id === currentId}
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
      </ul>
    </div>
  );
}
