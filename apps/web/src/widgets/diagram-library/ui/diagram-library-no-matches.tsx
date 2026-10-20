import type { JSX } from "react";

import { useT } from "@shared/i18n";

export function DiagramLibraryNoMatches(): JSX.Element {
  const t = useT();

  return (
    <p className="p-4 text-sm text-muted-foreground">
      {t("editor.library.noMatches")}
    </p>
  );
}
