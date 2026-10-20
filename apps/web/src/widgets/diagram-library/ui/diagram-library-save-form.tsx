import type { JSX, ReactNode } from "react";

import { IconDeviceFloppy } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

export interface DiagramLibrarySaveFormProps {
  readonly name: string;
  readonly onNameChange: (name: string) => void;
  readonly onSubmit: () => void;
  readonly disabled: boolean;
  readonly children?: ReactNode;
}

export function DiagramLibrarySaveForm({
  name,
  onNameChange,
  onSubmit,
  disabled,
  children,
}: DiagramLibrarySaveFormProps): JSX.Element {
  const t = useT();

  return (
    <form
      className="flex flex-col gap-2.5 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex h-10 rounded-2xl bg-input/50">
        <Input
          className="h-full border-none bg-transparent pl-4 focus-visible:border-transparent focus-visible:ring-0"
          aria-label={t("editor.library.nameLabel")}
          placeholder={t("editor.library.namePlaceholder")}
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value);
          }}
        />

        <Button
          type="submit"
          className="h-full w-[40%] shrink-0 rounded-2xl"
          disabled={disabled}
        >
          <IconDeviceFloppy />
          <span className="truncate">{t("editor.library.saveNew")}</span>
        </Button>
      </div>

      {children}
    </form>
  );
}
