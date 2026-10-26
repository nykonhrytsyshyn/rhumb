import type { JSX } from "react";

import { IconCheck, IconCopy } from "@tabler/icons-react";

import { useI18n } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import {
  DOCS_EXAMPLES,
  type DocsExampleId,
} from "../../../config/docs-examples";
import { useCopyFeedback } from "./use-copy-feedback";

export interface DocsExampleProps {
  readonly id: DocsExampleId;
}

export function DocsExample({ id }: DocsExampleProps): JSX.Element {
  const { language, t } = useI18n();
  const { copied, copy } = useCopyFeedback();
  const code = DOCS_EXAMPLES[id][language];

  return (
    <figure className="overflow-hidden rounded-2xl border bg-background">
      <figcaption className="flex items-center justify-between gap-2 border-b px-3 py-1 text-xs text-muted-foreground">
        {t("docs.example")}

        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            copy(code);
          }}
        >
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? t("docs.copied") : t("docs.copy")}
        </Button>
      </figcaption>

      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
