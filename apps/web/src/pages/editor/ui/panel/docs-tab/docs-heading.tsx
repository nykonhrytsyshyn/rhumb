import type { JSX } from "react";

export interface DocsHeadingProps {
  readonly children: string;
}

export function DocsHeading({ children }: DocsHeadingProps): JSX.Element {
  return <h3 className="text-xs tracking-wider uppercase">{children}</h3>;
}
