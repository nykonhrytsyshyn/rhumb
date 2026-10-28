import type { CSSProperties, ReactNode } from "react";

import { highlightTree, tagHighlighter } from "@lezer/highlight";

import { SYNTAX_STYLES } from "./editor-theme";
import { mermaidLanguage } from "./mermaid-language";

const highlighter = tagHighlighter(
  SYNTAX_STYLES.map(({ tag }, index) => ({ tag, class: `s${String(index)}` })),
);

const STYLES: readonly CSSProperties[] = SYNTAX_STYLES.map((entry) => {
  const { ...css } = entry;

  return css;
});

function toStyle(classes: string): CSSProperties {
  return Object.assign(
    {},
    ...classes.split(" ").map((name) => STYLES[Number(name.slice(1))]),
  ) as CSSProperties;
}

export function highlightMermaid(value: string): ReactNode[][] {
  const code = value.endsWith("\n") ? value.slice(0, -1) : value;
  const lines: ReactNode[][] = [[]];
  let key = 0;

  const push = (text: string, style?: CSSProperties) => {
    text.split("\n").forEach((part, index) => {
      if (index > 0) {
        lines.push([]);
      }

      if (part) {
        lines[lines.length - 1]?.push(
          <span key={key++} style={style}>
            {part}
          </span>,
        );
      }
    });
  };

  let pos = 0;

  highlightTree(
    mermaidLanguage.parser.parse(code),
    highlighter,
    (from, to, classes) => {
      if (from > pos) {
        push(code.slice(pos, from));
      }

      push(code.slice(from, to), toStyle(classes));
      pos = to;
    },
  );

  if (pos < code.length) {
    push(code.slice(pos));
  }

  return lines;
}
