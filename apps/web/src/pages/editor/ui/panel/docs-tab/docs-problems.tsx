import type { JSX } from "react";

export interface DocsProblemsProps {
  readonly rows: readonly (readonly [string, string])[];
}

export function DocsProblems({ rows }: DocsProblemsProps): JSX.Element {
  return (
    <dl className="divide-y rounded-2xl border bg-background">
      {rows.map(([message, fix]) => (
        <div key={message} className="flex flex-col gap-1 px-3 py-2">
          <dt>
            <code className="font-mono text-xs break-words">{message}</code>
          </dt>

          <dd className="text-sm text-muted-foreground">{fix}</dd>
        </div>
      ))}
    </dl>
  );
}
