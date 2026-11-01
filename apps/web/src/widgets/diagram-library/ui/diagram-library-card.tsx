import { type JSX, type ReactNode, useState } from "react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Checkbox } from "@shared/ui/checkbox";

import { DiagramLibraryCardDeleteDialog } from "./diagram-library-card-delete-dialog";
import { type DiagramLibraryCardDetails } from "./diagram-library-card-details";
import { DiagramLibraryCardMenu } from "./diagram-library-card-menu";
import { DiagramLibraryCardTitle } from "./diagram-library-card-title";

export interface DiagramLibraryCardSelection {
  readonly selected: boolean;
  readonly onSelectedChange: (selected: boolean) => void;
}

export interface DiagramLibraryCardProps {
  readonly name: string;
  readonly updatedAt: number;
  readonly details: DiagramLibraryCardDetails;
  readonly current: boolean;
  readonly thumbnail: ReactNode;
  readonly selection?: DiagramLibraryCardSelection;
  readonly onOpen: () => void;
  readonly onRename: (name: string) => void;
  readonly onDuplicate: () => void;
  readonly onDownload: () => void;
  readonly onDelete: () => void;
}

export function DiagramLibraryCard({
  name,
  updatedAt,
  details,
  current,
  thumbnail,
  selection,
  onOpen,
  onRename,
  onDuplicate,
  onDownload,
  onDelete,
}: DiagramLibraryCardProps): JSX.Element {
  const t = useT();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function finishRename(apply: boolean): void {
    const next = draftName.trim();

    setRenaming(false);

    if (apply && next !== "" && next !== name) {
      onRename(next);
    } else {
      setDraftName(name);
    }
  }

  const selected = selection?.selected === true;

  return (
    <li
      data-current={current}
      data-selected={selected}
      className={cn(
        "relative aspect-square overflow-hidden border-r border-b bg-card bg-drafting-grid",
        (current || selected) &&
          "after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-foreground after:ring-inset",
        selected && "after:ring-2",
      )}
    >
      {/* Thumbnail */}
      <button
        type="button"
        aria-label={t(
          selection === undefined
            ? "editor.library.open"
            : "editor.library.selectCard",
          { name },
        )}
        aria-pressed={selection === undefined ? undefined : selected}
        className="absolute inset-0 pb-12 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={
          selection === undefined
            ? onOpen
            : () => {
                selection.onSelectedChange(!selected);
              }
        }
      >
        {thumbnail}
      </button>

      {selected ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-foreground/5"
        />
      ) : null}

      {/* Selection checkbox */}
      {selection === undefined ? null : (
        <Checkbox
          checked={selected}
          aria-label={t("editor.library.selectCard", { name })}
          className="absolute top-2 right-2"
          onCheckedChange={selection.onSelectedChange}
        />
      )}

      {/* Current badge */}
      {current ? (
        <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
          {t("editor.library.current")}
        </span>
      ) : null}

      {/* Bottom bar with name, updated date, and actions */}
      <div className="absolute inset-x-0 bottom-0 flex h-12 items-center border-t bg-background/90">
        <div className="min-w-0 flex-1">
          <DiagramLibraryCardTitle
            name={name}
            updatedAt={updatedAt}
            renaming={renaming}
            draftName={draftName}
            onDraftNameChange={setDraftName}
            onFinishRename={finishRename}
          />
        </div>

        <DiagramLibraryCardMenu
          name={name}
          details={details}
          onRename={() => {
            setDraftName(name);
            setRenaming(true);
          }}
          onDuplicate={onDuplicate}
          onDownload={onDownload}
          onDelete={() => {
            setConfirmingDelete(true);
          }}
        />
      </div>

      <DiagramLibraryCardDeleteDialog
        name={name}
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        onConfirm={onDelete}
      />
    </li>
  );
}
