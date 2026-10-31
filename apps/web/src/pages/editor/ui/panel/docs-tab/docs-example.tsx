import { type JSX, type ReactNode, useEffect, useMemo, useState } from "react";

import { IconCode, IconTextWrap } from "@tabler/icons-react";

import { loadMermaidHighlighter } from "@widgets/source-editor";

import { useI18n } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@shared/ui/code-block";

import {
  DOCS_EXAMPLES,
  type DocsExampleId,
} from "../../../config/docs-examples";

export interface DocsExampleProps {
  readonly id: DocsExampleId;
}

export function DocsExample({ id }: DocsExampleProps): JSX.Element {
  const { language, t } = useI18n();
  const [wrap, setWrap] = useState(false);
  const code = DOCS_EXAMPLES[id][language];

  const [highlight, setHighlight] = useState<
    ((value: string) => ReactNode[][]) | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    loadMermaidHighlighter()
      .then((next) => {
        if (!cancelled) {
          setHighlight(() => next);
        }
      })
      .catch(() => {
        /* plain text fallback */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo<ReactNode[]>(
    () => (highlight ? highlight(code) : code.split("\n")),
    [highlight, code],
  );

  return (
    <CodeBlock size="sm">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <IconCode />
          {t("docs.example")}
        </CodeBlockTitle>

        <CodeBlockActions>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Wrap lines"
            aria-pressed={wrap}
            className="aria-pressed:text-foreground"
            onClick={() => {
              setWrap(!wrap);
            }}
          >
            <IconTextWrap />
          </Button>

          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>

      <CodeBlockContent id={id} wrap={wrap} lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
