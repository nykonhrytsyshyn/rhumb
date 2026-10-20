import type { TranslationKey } from "@shared/i18n";

export const DOCS_LINES: readonly (readonly [string, TranslationKey])[] = [
  ["A --> B", "docs.lines.solid"],
  ["A --- B", "docs.lines.plain"],
  ["A -.-> B", "docs.lines.dashed"],
  ["A ==> B", "docs.lines.thick"],
];
