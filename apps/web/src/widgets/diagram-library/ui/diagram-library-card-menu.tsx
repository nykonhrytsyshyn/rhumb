import type { JSX } from "react";

import {
  IconCopy,
  IconDots,
  IconDownload,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

export interface DiagramLibraryCardMenuProps {
  readonly name: string;
  readonly onRename: () => void;
  readonly onDuplicate: () => void;
  readonly onDownload: () => void;
  readonly onDelete: () => void;
}

export function DiagramLibraryCardMenu({
  name,
  onRename,
  onDuplicate,
  onDownload,
  onDelete,
}: DiagramLibraryCardMenuProps): JSX.Element {
  const t = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="h-full w-12 rounded-none border-0 border-l"
            aria-label={t("editor.library.actions", { name })}
          />
        }
      >
        <IconDots />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}>
          <IconPencil /> {t("editor.library.rename")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <IconCopy /> {t("editor.library.duplicate")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownload}>
          <IconDownload /> {t("editor.library.download")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <IconTrash /> {t("editor.library.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
