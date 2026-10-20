import type { JSX } from "react";

import { useI18n } from "@shared/i18n";
import { Input } from "@shared/ui/input";

export interface DiagramLibraryCardTitleProps {
  readonly name: string;
  readonly updatedAt: number;
  readonly renaming: boolean;
  readonly draftName: string;
  readonly onDraftNameChange: (name: string) => void;
  readonly onFinishRename: (apply: boolean) => void;
}

export function DiagramLibraryCardTitle({
  name,
  updatedAt,
  renaming,
  draftName,
  onDraftNameChange,
  onFinishRename,
}: DiagramLibraryCardTitleProps): JSX.Element {
  const { t, language } = useI18n();

  if (renaming) {
    return (
      <Input
        autoFocus
        aria-label={t("editor.library.renameLabel")}
        value={draftName}
        className="h-full w-full rounded-none border-none bg-transparent px-2 text-xs focus-visible:border-transparent focus-visible:ring-0"
        onChange={(event) => {
          onDraftNameChange(event.target.value);
        }}
        onBlur={() => {
          onFinishRename(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onFinishRename(true);
          }

          if (event.key === "Escape") {
            onFinishRename(false);
          }
        }}
      />
    );
  }

  const updated = new Intl.DateTimeFormat(language, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(updatedAt);

  return (
    <div className="px-2 py-1.5">
      <p className="truncate text-xs font-medium">{name}</p>
      <p className="truncate text-[10px] text-muted-foreground">
        {t("editor.library.updated", { date: updated })}
      </p>
    </div>
  );
}
