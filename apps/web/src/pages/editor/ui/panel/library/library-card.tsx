import { type JSX, useState } from "react";

import {
  IconCopy,
  IconDots,
  IconDownload,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { useI18n } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/ui/alert-dialog";
import { Button } from "@shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";
import { Input } from "@shared/ui/input";

import type { SavedDiagram } from "../../../model/diagram-store";
import { DiagramThumbnail } from "./diagram-thumbnail";

export interface LibraryCardProps {
  readonly diagram: SavedDiagram;
  readonly profile: StandardProfile | undefined;
  /** True for the diagram that is open in the editor right now. */
  readonly current: boolean;
  readonly onOpen: () => void;
  readonly onRename: (name: string) => void;
  readonly onDuplicate: () => void;
  readonly onDownload: () => void;
  readonly onDelete: () => void;
}

export function LibraryCard({
  diagram,
  profile,
  current,
  onOpen,
  onRename,
  onDuplicate,
  onDownload,
  onDelete,
}: LibraryCardProps): JSX.Element {
  const { t, language } = useI18n();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(diagram.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const updated = new Intl.DateTimeFormat(language, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(diagram.updatedAt);

  function finishRename(apply: boolean): void {
    const next = draftName.trim();

    setRenaming(false);

    if (apply && next !== "" && next !== diagram.name) {
      onRename(next);
    } else {
      setDraftName(diagram.name);
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
        aria-label={t("editor.library.open", { name: diagram.name })}
        className="absolute inset-0 pb-12 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={onOpen}
      >
        <DiagramThumbnail source={diagram.source} profile={profile} />
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
          {renaming ? (
            <Input
              autoFocus
              aria-label={t("editor.library.renameLabel")}
              value={draftName}
              className="h-full w-full rounded-none border-none bg-transparent px-2 text-xs focus-visible:border-transparent focus-visible:ring-0"
              onChange={(event) => {
                setDraftName(event.target.value);
              }}
              onBlur={() => {
                finishRename(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  finishRename(true);
                }

                if (event.key === "Escape") {
                  finishRename(false);
                }
              }}
            />
          ) : (
            <div className="px-2 py-1.5">
              <p className="truncate text-xs font-medium">{diagram.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {t("editor.library.updated", { date: updated })}
              </p>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="h-full w-12 rounded-none border-0 border-l"
                aria-label={t("editor.library.actions", {
                  name: diagram.name,
                })}
              />
            }
          >
            <IconDots />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setDraftName(diagram.name);
                setRenaming(true);
              }}
            >
              <IconPencil /> {t("editor.library.rename")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <IconCopy /> {t("editor.library.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <IconDownload /> {t("editor.library.download")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setConfirmingDelete(true);
              }}
            >
              <IconTrash /> {t("editor.library.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("editor.library.deleteTitle", { name: diagram.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("editor.library.deleteText")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("editor.library.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              {t("editor.library.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
