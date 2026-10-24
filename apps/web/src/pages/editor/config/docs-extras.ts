import type { TranslationKey } from "@shared/i18n";

export const DOCS_EXTRAS: readonly (readonly [string, TranslationKey])[] = [
  ["shape: doc", "docs.extras.shape"],
  ["ident: P1", "docs.extras.ident"],
  ["desc: text", "docs.extras.desc"],
  ["input: text", "docs.extras.input"],
  ["ref: X84", "docs.extras.ref"],
  ["stack: 3", "docs.extras.stack"],
  ["loop: i", "docs.extras.loop"],
  ["side: left", "docs.extras.side"],
  ["legend: text", "docs.extras.legend"],
];

export const DOCS_STRUCTURE: readonly (readonly [string, TranslationKey])[] = [
  ["subgraph S [Title] ... end", "docs.structure.frame"],
  ["N[*text*] -.- A", "docs.structure.comment"],
  ["N[*text*] -.- S", "docs.structure.frameComment"],
  ["A -->|...| B", "docs.structure.skip"],
  ["A -->|~| B", "docs.structure.channel"],
];
