import type { TranslationKey } from "@shared/i18n";

import type { DocsExampleId } from "./docs-examples";
import {
  DOCS_BLOCK_ROWS,
  DOCS_ERROR_ROWS,
  DOCS_EXTRA_ROWS,
  DOCS_FRAME_ROWS,
  DOCS_LINE_ROWS,
  type DocsRow,
} from "./docs-rows";

export type DocsItem =
  | { readonly kind: "text"; readonly key: TranslationKey }
  | { readonly kind: "tip"; readonly key: TranslationKey }
  | { readonly kind: "warning"; readonly key: TranslationKey }
  | { readonly kind: "steps"; readonly keys: readonly TranslationKey[] }
  | { readonly kind: "list"; readonly keys: readonly TranslationKey[] }
  | { readonly kind: "rows"; readonly rows: readonly DocsRow[] }
  | { readonly kind: "problems"; readonly rows: readonly DocsRow[] }
  | { readonly kind: "example"; readonly id: DocsExampleId }
  | { readonly kind: "agents" };

export const DOCS_SECTION_IDS = [
  "start",
  "structure",
  "blocks",
  "shapes",
  "lines",
  "decisions",
  "frames",
  "parallel",
  "errors",
  "standards",
  "agents",
] as const;

export type DocsSectionId = (typeof DOCS_SECTION_IDS)[number];

export interface DocsSection {
  readonly id: DocsSectionId;
  readonly title: TranslationKey;
  readonly items: readonly DocsItem[];
}

export const DOCS_DEFAULT_OPEN: readonly DocsSectionId[] = ["start"];

export const DOCS_SECTIONS: readonly DocsSection[] = [
  {
    id: "start",
    title: "docs.start.title",
    items: [
      { kind: "text", key: "docs.start.text" },
      { kind: "example", id: "start" },
      {
        kind: "steps",
        keys: [
          "docs.start.steps.header",
          "docs.start.steps.blocks",
          "docs.start.steps.lines",
          "docs.start.steps.branches",
          "docs.start.steps.export",
        ],
      },
    ],
  },
  {
    id: "structure",
    title: "docs.structure.title",
    items: [
      {
        kind: "list",
        keys: [
          "docs.structure.header",
          "docs.structure.statements",
          "docs.structure.comment",
          "docs.structure.identifier",
          "docs.structure.define",
        ],
      },
      { kind: "text", key: "docs.structure.quotes" },
      { kind: "example", id: "quotes" },
      { kind: "text", key: "docs.structure.breaks" },
    ],
  },
  {
    id: "blocks",
    title: "docs.blocks.title",
    items: [
      { kind: "text", key: "docs.blocks.text" },
      { kind: "rows", rows: DOCS_BLOCK_ROWS },
      { kind: "tip", key: "docs.blocks.tip" },
    ],
  },
  {
    id: "shapes",
    title: "docs.shapes.title",
    items: [
      { kind: "text", key: "docs.shapes.text" },
      { kind: "example", id: "byName" },
      { kind: "rows", rows: DOCS_EXTRA_ROWS },
      { kind: "warning", key: "docs.shapes.warning" },
    ],
  },
  {
    id: "lines",
    title: "docs.lines.title",
    items: [
      { kind: "rows", rows: DOCS_LINE_ROWS },
      { kind: "text", key: "docs.lines.text" },
    ],
  },
  {
    id: "decisions",
    title: "docs.decisions.title",
    items: [
      { kind: "text", key: "docs.decisions.branches" },
      { kind: "text", key: "docs.decisions.preparation" },
      { kind: "example", id: "loop" },
      { kind: "text", key: "docs.decisions.limits" },
      { kind: "example", id: "limits" },
    ],
  },
  {
    id: "frames",
    title: "docs.frames.title",
    items: [
      { kind: "text", key: "docs.frames.frame" },
      { kind: "text", key: "docs.frames.comment" },
      { kind: "example", id: "frames" },
      { kind: "rows", rows: DOCS_FRAME_ROWS },
    ],
  },
  {
    id: "parallel",
    title: "docs.parallel.title",
    items: [
      { kind: "text", key: "docs.parallel.bars" },
      { kind: "example", id: "parallel" },
      { kind: "text", key: "docs.parallel.transfer" },
      { kind: "text", key: "docs.parallel.sheets" },
      { kind: "example", id: "sheets" },
    ],
  },
  {
    id: "errors",
    title: "docs.errors.title",
    items: [
      { kind: "text", key: "docs.errors.text" },
      { kind: "problems", rows: DOCS_ERROR_ROWS },
    ],
  },
  {
    id: "standards",
    title: "docs.standards.title",
    items: [{ kind: "text", key: "docs.standards.text" }],
  },
  {
    id: "agents",
    title: "docs.agents.title",
    items: [
      { kind: "text", key: "docs.agents.text" },
      { kind: "agents" },
      {
        kind: "list",
        keys: ["docs.agents.skill", "docs.agents.prompt", "docs.agents.link"],
      },
      { kind: "text", key: "docs.agents.note" },
    ],
  },
];
