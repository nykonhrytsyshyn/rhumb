import type { JSX, ReactNode } from "react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Checkbox } from "@shared/ui/checkbox";

export interface DiagramLibrarySelectionBarProps {
  readonly count: number;
  readonly total: number;
  readonly allSelected: boolean;
  readonly onToggleAll: (selected: boolean) => void;
  readonly onClear: () => void;
  readonly children?: ReactNode;
}

export function DiagramLibrarySelectionBar({
  count,
  total,
  allSelected,
  onToggleAll,
  onClear,
  children,
}: DiagramLibrarySelectionBarProps): JSX.Element {
  const t = useT();

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b pl-4">
      <Checkbox
        checked={allSelected}
        indeterminate={count > 0 && !allSelected}
        aria-label={t("editor.library.select.all")}
        disabled={total === 0}
        onCheckedChange={onToggleAll}
      />

      <p role="status" className="min-w-0 flex-1 truncate text-xs tabular-nums">
        {t("editor.library.select.count", { count, total })}
      </p>

      {count === 0 ? null : (
        <Button
          type="button"
          variant="text"
          size="xs"
          onClick={onClear}
          className="h-full"
        >
          {t("editor.library.select.clear")}
        </Button>
      )}

      <div className="flex h-full shrink-0">{children}</div>
    </div>
  );
}
