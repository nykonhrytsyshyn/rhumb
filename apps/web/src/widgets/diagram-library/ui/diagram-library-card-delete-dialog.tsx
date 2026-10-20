import type { JSX } from "react";

import { useT } from "@shared/i18n";
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

export interface DiagramLibraryCardDeleteDialogProps {
  readonly name: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
}

export function DiagramLibraryCardDeleteDialog({
  name,
  open,
  onOpenChange,
  onConfirm,
}: DiagramLibraryCardDeleteDialogProps): JSX.Element {
  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("editor.library.deleteTitle", { name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("editor.library.deleteText")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("editor.library.cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t("editor.library.confirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
