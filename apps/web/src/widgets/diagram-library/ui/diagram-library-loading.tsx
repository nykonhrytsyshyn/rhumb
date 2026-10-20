import type { JSX } from "react";

import { useT } from "@shared/i18n";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shared/ui/empty";
import { Spinner } from "@shared/ui/spinner";

export function DiagramLibraryLoading(): JSX.Element {
  const t = useT();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>

        <EmptyTitle>{t("editor.library.loadingTitle")}</EmptyTitle>

        <EmptyDescription>
          {t("editor.library.loadingDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
