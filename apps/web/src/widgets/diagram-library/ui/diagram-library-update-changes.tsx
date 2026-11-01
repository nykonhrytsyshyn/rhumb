import type { JSX } from "react";

export interface DiagramLibraryUpdateChange {
  readonly label: string;
  readonly before: string;
  readonly after: string;
}

export interface DiagramLibraryUpdateChangesProps {
  readonly changes: readonly DiagramLibraryUpdateChange[];
}

export function DiagramLibraryUpdateChanges({
  changes,
}: DiagramLibraryUpdateChangesProps): JSX.Element {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-6 text-xs">
      {changes.map((change) => (
        <div key={change.label} className="contents">
          <dt className="text-muted-foreground">{change.label}</dt>
          <dd className="text-right font-medium tabular-nums">
            {change.before === change.after
              ? change.after
              : `${change.before} → ${change.after}`}
          </dd>
        </div>
      ))}
    </dl>
  );
}
