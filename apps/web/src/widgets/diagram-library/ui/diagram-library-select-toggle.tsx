import type { JSX } from "react";

import { IconChecklist } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

export interface DiagramLibrarySelectToggleProps {
  readonly active: boolean;
  readonly onActiveChange: (active: boolean) => void;
}

export function DiagramLibrarySelectToggle({
  active,
  onActiveChange,
}: DiagramLibrarySelectToggleProps): JSX.Element {
  const t = useT();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-pressed={active}
      aria-label={t(
        active ? "editor.library.select.stop" : "editor.library.select.start",
      )}
      title={t(
        active ? "editor.library.select.stop" : "editor.library.select.start",
      )}
      className={cn(
        "h-full w-12 rounded-none border-0 border-l",
        active && "bg-muted text-foreground",
      )}
      onClick={() => {
        onActiveChange(!active);
      }}
    >
      <IconChecklist />
    </Button>
  );
}
