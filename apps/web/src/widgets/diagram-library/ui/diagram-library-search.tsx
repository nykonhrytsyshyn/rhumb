import type { JSX } from "react";

import { IconSearch } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Input } from "@shared/ui/input";

export interface DiagramLibrarySearchProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export function DiagramLibrarySearch({
  value,
  onChange,
}: DiagramLibrarySearchProps): JSX.Element {
  const t = useT();

  return (
    <div className="relative border-y">
      <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={t("editor.library.search")}
        placeholder={t("editor.library.search")}
        className="h-12 rounded-none border-none bg-transparent pl-11 focus-visible:border-transparent focus-visible:bg-input/50 focus-visible:ring-0"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </div>
  );
}
