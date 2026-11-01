import type { JSX, ReactNode } from "react";

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

export interface DiagramLibraryUpdateDialogProps {
  readonly name: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
  readonly unchanged: boolean;
  readonly children: ReactNode;
}

export function DiagramLibraryUpdateDialog({
  name,
  open,
  onOpenChange,
  onConfirm,
  unchanged,
  children,
}: DiagramLibraryUpdateDialogProps): JSX.Element {
  const t = useT();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-2xl">
        <AlertDialogHeader className="px-6 pt-6">
          <AlertDialogTitle>
            {t("editor.library.updateDialog.title", { name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {unchanged
              ? t("editor.library.updateDialog.unchanged")
              : t("editor.library.updateDialog.text")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter className="px-6 pb-6">
          <AlertDialogCancel>{t("editor.library.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={unchanged}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t("editor.library.updateDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
