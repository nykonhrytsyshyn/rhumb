import type { JSX } from "react";

import { IconBinaryTree2 } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shared/ui/empty";

export function DiagramLibraryEmpty(): JSX.Element {
  const t = useT();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBinaryTree2 />
        </EmptyMedia>

        <EmptyTitle>{t("editor.library.emptyTitle")}</EmptyTitle>

        <EmptyDescription>
          {t("editor.library.emptyDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
