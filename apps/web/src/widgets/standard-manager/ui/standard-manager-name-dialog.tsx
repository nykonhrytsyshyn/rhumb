import { type JSX, type ReactNode, useState } from "react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";

export type StandardNameIssue = "empty" | "tooLong" | "taken";

export interface StandardManagerNameDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: "create" | "rename";
  readonly initialName: string;
  readonly maxLength: number;
  readonly checkName: (name: string) => StandardNameIssue | undefined;
  readonly onSubmit: (name: string) => void;
  /** Extra fields under the name, such as the standard to start from. */
  readonly children?: ReactNode;
}

interface FormProps extends Omit<
  StandardManagerNameDialogProps,
  "open" | "onOpenChange" | "children"
> {
  readonly children?: ReactNode;
  readonly onDone: () => void;
}

function NameForm({
  mode,
  initialName,
  maxLength,
  checkName,
  onSubmit,
  onDone,
  children,
}: FormProps): JSX.Element {
  const t = useT();
  const [name, setName] = useState(initialName);
  const issue = checkName(name);
  // An empty name only keeps the button off; nagging starts once there is text
  const message =
    issue === undefined || issue === "empty"
      ? undefined
      : t(`editor.config.nameErrors.${issue}`, { max: maxLength });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (issue === undefined) {
          onSubmit(name.trim());
          onDone();
        }
      }}
    >
      <DialogHeader className="pb-1">
        <DialogTitle>{t(`editor.config.nameDialog.${mode}Title`)}</DialogTitle>
        <DialogDescription>
          {t(`editor.config.nameDialog.${mode}Text`)}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="standard-name" className="text-xs uppercase">
          {t("editor.config.nameDialog.nameLabel")}
        </Label>
        <Input
          id="standard-name"
          value={name}
          autoFocus
          autoComplete="off"
          aria-invalid={message !== undefined}
          placeholder={t("editor.config.nameDialog.namePlaceholder")}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        {message === undefined ? null : (
          <p role="alert" className="text-xs text-destructive">
            {message}
          </p>
        )}
      </div>

      {children}

      <DialogFooter className="pt-2">
        <DialogClose render={<Button variant="outline" type="button" />}>
          {t("editor.config.cancel")}
        </DialogClose>
        <Button type="submit" disabled={issue !== undefined}>
          {t(`editor.config.nameDialog.${mode}`)}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function StandardManagerNameDialog({
  open,
  onOpenChange,
  children,
  ...form
}: StandardManagerNameDialogProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <NameForm
          {...form}
          onDone={() => {
            onOpenChange(false);
          }}
        >
          {children}
        </NameForm>
      </DialogContent>
    </Dialog>
  );
}
