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

export interface DiagramLibraryBulkDeleteDialogProps {
  readonly count: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
}

export function DiagramLibraryBulkDeleteDialog({
  count,
  open,
  onOpenChange,
  onConfirm,
}: DiagramLibraryBulkDeleteDialogProps): JSX.Element {
  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("editor.library.select.deleteTitle", { count })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("editor.library.select.deleteText")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("editor.library.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t("editor.library.select.confirmDelete", { count })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
