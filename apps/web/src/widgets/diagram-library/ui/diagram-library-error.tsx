import type { JSX } from "react";

import { useT } from "@shared/i18n";
import { Alert } from "@shared/ui/alert";

export interface DiagramLibraryErrorProps {
  readonly message: string;
}

export function DiagramLibraryError({
  message,
}: DiagramLibraryErrorProps): JSX.Element {
  const t = useT();

  return (
    <Alert>
      {t("editor.library.storageFailed")}
      {"\n"}
      {message}
    </Alert>
  );
}
