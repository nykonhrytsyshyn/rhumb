import type { JSX } from "react";

import { IconInfoCircle } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Alert } from "@shared/ui/alert";
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
import { Label } from "@shared/ui/label";
import { Spinner } from "@shared/ui/spinner";

import { StandardManagerSelect } from "./standard-manager-select";
import type { StandardOption } from "./standard-option";

export interface StandardManagerDeleteDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly usedBy: number | undefined;
  readonly builtIn: readonly StandardOption[];
  readonly custom: readonly StandardOption[];
  readonly replacementId: string;
  readonly onReplacementChange: (id: string) => void;
  readonly onConfirm: () => void;
}

export function StandardManagerDeleteDialog({
  open,
  onOpenChange,
  title,
  usedBy,
  builtIn,
  custom,
  replacementId,
  onReplacementChange,
  onConfirm,
}: StandardManagerDeleteDialogProps): JSX.Element {
  const t = useT();
  const moves = usedBy !== undefined && usedBy > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("editor.config.deleteDialog.title", { title })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("editor.config.deleteDialog.text")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {usedBy === undefined ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            {t("editor.config.deleteDialog.loading")}
          </p>
        ) : null}

        {moves ? (
          <div className="flex flex-col gap-2">
            <Alert variant="destructive">
              <IconInfoCircle className="size-4 shrink-0" />

              <span>
                {t("editor.config.deleteDialog.usedText", { count: usedBy })}
              </span>
            </Alert>

            <Label
              htmlFor="standard-replacement"
              className="pt-4 text-xs uppercase"
            >
              {t("editor.config.deleteDialog.replaceLabel")}
            </Label>

            <StandardManagerSelect
              id="standard-replacement"
              value={replacementId}
              onValueChange={onReplacementChange}
              builtIn={builtIn}
              custom={custom}
              hideEmptyHint
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>{t("editor.config.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={usedBy === undefined}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t(
              moves
                ? "editor.config.deleteDialog.confirmMove"
                : "editor.config.deleteDialog.confirm",
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
