import type { JSX } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

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
    <Alert variant="banner-destructive">
      <IconAlertTriangle className="size-4 shrink-0" />
      {t("editor.library.storageFailed")}
      {"\n"}
      {message}
    </Alert>
  );
}
