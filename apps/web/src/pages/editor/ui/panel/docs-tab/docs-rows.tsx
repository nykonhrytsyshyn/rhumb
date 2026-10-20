import type { JSX } from "react";

export interface DocsRowsProps {
  readonly rows: readonly (readonly [string, string])[];
}

export function DocsRows({ rows }: DocsRowsProps): JSX.Element {
  return (
    <dl className="divide-y rounded-2xl border">
      {rows.map(([code, text]) => (
        <div
          key={code}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <dt>
            <code className="font-mono text-xs">{code}</code>
          </dt>

          <dd className="text-right text-sm text-muted-foreground">{text}</dd>
        </div>
      ))}
    </dl>
  );
}
