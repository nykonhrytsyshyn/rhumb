import type { JSX } from "react";

import { IconCheck } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { useCopyFeedback } from "@shared/lib/use-copy-feedback";

function CopyCode({ code }: { readonly code: string }): JSX.Element {
  const t = useT();
  const { copied, copy } = useCopyFeedback();

  return (
    <button
      type="button"
      title={t("docs.copy")}
      className="inline-flex items-center gap-1.5 rounded-md text-left font-mono text-xs hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      onClick={() => {
        copy(code);
      }}
    >
      {code}
      {copied && <IconCheck className="size-3 shrink-0" aria-hidden />}
    </button>
  );
}

export interface DocsRowsProps {
  readonly rows: readonly (readonly [string, string])[];
}

export function DocsRows({ rows }: DocsRowsProps): JSX.Element {
  return (
    <dl className="divide-y rounded-2xl border bg-background/25">
      {rows.map(([code, text]) => (
        <div
          key={code}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <dt className="min-w-0 wrap-break-word">
            <CopyCode code={code} />
          </dt>

          <dd className="text-right text-sm text-muted-foreground">{text}</dd>
        </div>
      ))}
    </dl>
  );
}
