import type { JSX } from "react";

import { AgentKitList } from "@features/agent-kit";

import { useT } from "@shared/i18n";

import type { DocsItem } from "../../../config/docs-sections";
import { DocsCallout } from "./docs-callout";
import { DocsExample } from "./docs-example";
import { DocsProblems } from "./docs-problems";
import { DocsRows } from "./docs-rows";

export interface DocsItemViewProps {
  readonly item: DocsItem;
}

export function DocsItemView({ item }: DocsItemViewProps): JSX.Element {
  const t = useT();

  switch (item.kind) {
    case "text":
      return <div className="text-muted-foreground">{t(item.key)}</div>;

    case "tip":
    case "warning":
      return <DocsCallout tone={item.kind}>{t(item.key)}</DocsCallout>;

    case "steps":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          {item.keys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
      );

    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {item.keys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      );

    case "rows":
      return <DocsRows rows={item.rows.map(([code, key]) => [code, t(key)])} />;

    case "problems":
      return (
        <DocsProblems rows={item.rows.map(([code, key]) => [code, t(key)])} />
      );

    case "example":
      return <DocsExample id={item.id} />;

    case "agents":
      return <AgentKitList />;
  }
}
