import type { NodeKind } from "@rhumb/kernel";

export interface ShapeDelimiters {
  readonly open: string;
  readonly close: string;
  readonly kind: NodeKind;
}

/** Longest openers first so that "([" wins over "(" and "[". */
export const SHAPE_DELIMITERS: readonly ShapeDelimiters[] = [
  { open: "([", close: "])", kind: "terminator" },
  { open: "[[", close: "]]", kind: "predefinedProcess" },
  { open: "[/", close: "/]", kind: "io" },
  { open: "[\\", close: "\\]", kind: "io" },
  { open: "((", close: "))", kind: "connector" },
  { open: "{{", close: "}}", kind: "preparation" },
  { open: "{", close: "}", kind: "decision" },
  { open: "(", close: ")", kind: "terminator" },
  { open: "[", close: "]", kind: "process" },
];
