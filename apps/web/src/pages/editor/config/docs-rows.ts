import type { TranslationKey } from "@shared/i18n";

export type DocsRow = readonly [code: string, key: TranslationKey];

export const DOCS_BLOCK_ROWS: readonly DocsRow[] = [
  ['A["text"]', "docs.blocks.process"],
  ['A(["text"])', "docs.blocks.terminator"],
  ['A{"text"}', "docs.blocks.decision"],
  ['A[/"text"/]', "docs.blocks.io"],
  ['A{{"text"}}', "docs.blocks.preparation"],
  ['A[["text"]]', "docs.blocks.predefined"],
  ['A(("text"))', "docs.blocks.connector"],
  ['A[)"text"(]', "docs.blocks.storedData"],
  ['A[#"text"#]', "docs.blocks.internalStorage"],
  ['A(@"text"@)', "docs.blocks.sequentialStorage"],
  ['A[("text")]', "docs.blocks.directStorage"],
  ['A[~"text"~]', "docs.blocks.document"],
  ['A[~~"text"~~]', "docs.blocks.paperTape"],
  ['A[^"text"^]', "docs.blocks.manualInput"],
  ['A[:"text":]', "docs.blocks.card"],
  ['A(="text"=)', "docs.blocks.display"],
  ['A[\\"text"/]', "docs.blocks.manualOperation"],
  ["A[=]", "docs.blocks.parallel"],
  ['A{^"name: text"^}', "docs.blocks.loopStart"],
  ['A{_"name"_}', "docs.blocks.loopEnd"],
  ['A(>"X">)', "docs.blocks.transfer"],
  ['A[*"text"*]', "docs.blocks.comment"],
];

export const DOCS_EXTRA_ROWS: readonly DocsRow[] = [
  ["shape: doc", "docs.extras.shape"],
  ['ident: "P1"', "docs.extras.ident"],
  ['desc: "text"', "docs.extras.desc"],
  ['input: "text"', "docs.extras.input"],
  ['ref: "X84"', "docs.extras.ref"],
  ["stack: 3", "docs.extras.stack"],
  ['loop: "i"', "docs.extras.loop"],
  ["side: left", "docs.extras.side"],
  ['legend: "text"', "docs.extras.legend"],
];

export const DOCS_LINE_ROWS: readonly DocsRow[] = [
  ["A --> B", "docs.lines.solid"],
  ["A --- B", "docs.lines.plain"],
  ["A -.-> B", "docs.lines.dashed"],
  ["A -.- B", "docs.lines.dashedPlain"],
  ["A ==> B", "docs.lines.thick"],
  ["A -->|text| B", "docs.lines.label"],
  ["A -- text --> B", "docs.lines.labelSpaced"],
  ["A -->|...| B", "docs.lines.skip"],
  ["A -->|~| B", "docs.lines.channel"],
];

export const DOCS_FRAME_ROWS: readonly DocsRow[] = [
  ['subgraph S ["Title"] ... end', "docs.frames.frameBlock"],
  ['N[*"text"*] -.- A', "docs.frames.commentBlock"],
  ['N[*"text"*] -.- S', "docs.frames.commentFrame"],
];

export const DOCS_ERROR_ROWS: readonly DocsRow[] = [
  ['"style" is not supported yet', "docs.errors.unsupported"],
  ["Expected a link such as -->", "docs.errors.link"],
  ['Expected "]" after quoted text', "docs.errors.quote"],
  ['Unknown shape "..."', "docs.errors.shape"],
  ['Missing "end" for the subgraph "..."', "docs.errors.end"],
  ['The frame "..." holds no blocks', "docs.errors.empty"],
  ['The comment "..." is not linked to a block or a frame', "docs.errors.note"],
  ['The loop "..." has no end to match', "docs.errors.loop"],
  ['Diagram type "..." is not supported yet', "docs.errors.type"],
];
