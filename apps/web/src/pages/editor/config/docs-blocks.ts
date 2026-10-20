import type { TranslationKey } from "@shared/i18n";

export const DOCS_BLOCKS: readonly (readonly [string, TranslationKey])[] = [
  ["A[text]", "docs.blocks.process"],
  ["A([text])", "docs.blocks.terminator"],
  ["A{text}", "docs.blocks.decision"],
  ["A[/text/]", "docs.blocks.io"],
  ["A{{text}}", "docs.blocks.preparation"],
  ["A[[text]]", "docs.blocks.predefined"],
  ["A((text))", "docs.blocks.connector"],
];
