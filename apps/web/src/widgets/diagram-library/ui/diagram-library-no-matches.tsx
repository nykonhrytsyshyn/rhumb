import type { JSX } from "react";

import { IconBinaryTree2, IconFilterOff } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shared/ui/empty";

export interface DiagramLibraryNoMatchesProps {
  readonly onReset?: () => void;
}

export function DiagramLibraryNoMatches({
  onReset,
}: DiagramLibraryNoMatchesProps): JSX.Element {
  const t = useT();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBinaryTree2 />
        </EmptyMedia>

        <EmptyTitle>{t("editor.library.noMatchesTitle")}</EmptyTitle>

        <EmptyDescription>
          {t("editor.library.noMatchesDescription")}
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {onReset === undefined ? null : (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            <IconFilterOff />
            {t("editor.library.filter.resetAll")}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
