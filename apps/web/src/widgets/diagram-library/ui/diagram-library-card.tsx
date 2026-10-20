import { type JSX, type ReactNode, useState } from "react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";

import { DiagramLibraryCardDeleteDialog } from "./diagram-library-card-delete-dialog";
import { DiagramLibraryCardMenu } from "./diagram-library-card-menu";
import { DiagramLibraryCardTitle } from "./diagram-library-card-title";

export interface DiagramLibraryCardProps {
  readonly name: string;
  readonly updatedAt: number;
  readonly current: boolean;
  readonly thumbnail: ReactNode;
  readonly onOpen: () => void;
  readonly onRename: (name: string) => void;
  readonly onDuplicate: () => void;
  readonly onDownload: () => void;
  readonly onDelete: () => void;
}

export function DiagramLibraryCard({
  name,
  updatedAt,
  current,
  thumbnail,
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

  return (
    <li
      data-current={current}
      className={cn(
        "relative aspect-square overflow-hidden border-r border-b bg-card bg-drafting-grid",
        current &&
          "after:pointer-events-none after:absolute after:inset-0 after:ring-1 after:ring-foreground after:ring-inset",
      )}
    >
      {/* Thumbnail */}
      <button
        type="button"
        aria-label={t("editor.library.open", { name })}
        className="absolute inset-0 pb-12 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={onOpen}
      >
        {thumbnail}
      </button>

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
