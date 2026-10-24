import type { NodeKind } from "@rhumb/kernel";

export interface ShapeDelimiters {
  readonly open: string;
  readonly close: string;
  readonly kind: NodeKind;
  /**
   * A form added on top of Mermaid. It only counts when it closes cleanly,
   * so that a label that merely starts with the same characters stays a
   * plain block.
   */
  readonly shortcut?: boolean;
}

/**
 * Longest openers first so that "([" wins over "(" and "[". Forms that share
 * an opener (the slashes) are told apart by their closer.
 */
export const SHAPE_DELIMITERS: readonly ShapeDelimiters[] = [
  { open: "[=]", close: "", kind: "parallel", shortcut: true },
  { open: "[~~", close: "~~]", kind: "paperTape", shortcut: true },
  { open: "([", close: "])", kind: "terminator" },
  { open: "[[", close: "]]", kind: "predefinedProcess" },
  { open: "[/", close: "/]", kind: "io" },
  { open: "[\\", close: "\\]", kind: "io", shortcut: true },
  { open: "[\\", close: "/]", kind: "manualOperation", shortcut: true },
  { open: "((", close: "))", kind: "connector" },
  { open: "{{", close: "}}", kind: "preparation" },
  { open: "[(", close: ")]", kind: "directStorage", shortcut: true },
  { open: "[)", close: "(]", kind: "storedData", shortcut: true },
  { open: "[#", close: "#]", kind: "internalStorage", shortcut: true },
  { open: "[~", close: "~]", kind: "document", shortcut: true },
  { open: "[^", close: "^]", kind: "manualInput", shortcut: true },
  { open: "[:", close: ":]", kind: "card", shortcut: true },
  { open: "[*", close: "*]", kind: "comment", shortcut: true },
  { open: "(@", close: "@)", kind: "sequentialStorage", shortcut: true },
  { open: "(=", close: "=)", kind: "display", shortcut: true },
  { open: "(>", close: ">)", kind: "transfer", shortcut: true },
  { open: "{^", close: "^}", kind: "loopStart", shortcut: true },
  { open: "{_", close: "_}", kind: "loopEnd", shortcut: true },
  { open: "{", close: "}", kind: "decision" },
  { open: "(", close: ")", kind: "terminator" },
  { open: "[", close: "]", kind: "process" },
];

export interface ShapeName {
  readonly kind: NodeKind;
  /** Copies drawn when the name stands for several blocks (`docs`). */
  readonly stack?: number;
  /** A stripe is drawn, with no reference in it yet (`div-rect`). */
  readonly striped?: boolean;
}

function names(
  shape: ShapeName,
  ...aliases: readonly string[]
): readonly (readonly [string, ShapeName])[] {
  return aliases.map((alias) => [alias, shape] as const);
}

/**
 * Names accepted in `@{ shape: ... }`. Mermaid's own names and aliases come
 * first for every block it also has; the rest are specific to Rhumb.
 */
export const SHAPE_NAMES: ReadonlyMap<string, ShapeName> = new Map([
  ...names({ kind: "process" }, "rect", "rectangle", "proc", "process"),
  ...names({ kind: "terminator" }, "stadium", "terminal", "pill"),
  ...names(
    { kind: "predefinedProcess" },
    "fr-rect",
    "subproc",
    "subroutine",
    "framed-rectangle",
  ),
  ...names({ kind: "decision" }, "diam", "diamond", "decision", "question"),
  ...names({ kind: "preparation" }, "hex", "hexagon", "prepare"),
  ...names(
    { kind: "io" },
    "lean-r",
    "lean-l",
    "lean-right",
    "lean-left",
    "in-out",
    "out-in",
    "io",
  ),
  ...names({ kind: "connector" }, "circ", "circle", "connector"),
  ...names(
    { kind: "storedData" },
    "bow-rect",
    "stored-data",
    "bow-tie-rectangle",
  ),
  ...names(
    { kind: "internalStorage" },
    "win-pane",
    "internal-storage",
    "window-pane",
  ),
  ...names(
    { kind: "sequentialStorage" },
    "seq-store",
    "sequential-storage",
    "tape",
  ),
  ...names(
    { kind: "directStorage" },
    "h-cyl",
    "das",
    "horizontal-cylinder",
    "cyl",
    "cylinder",
    "database",
    "db",
  ),
  ...names({ kind: "document" }, "doc", "document"),
  ...names(
    { kind: "document", stack: 3 },
    "docs",
    "documents",
    "st-doc",
    "stacked-document",
  ),
  ...names({ kind: "paperTape" }, "flag", "paper-tape"),
  ...names(
    { kind: "manualInput" },
    "sl-rect",
    "manual-input",
    "sloped-rectangle",
  ),
  ...names({ kind: "card" }, "notch-rect", "card", "notched-rectangle"),
  ...names({ kind: "display" }, "curv-trap", "display", "curved-trapezoid"),
  ...names(
    { kind: "manualOperation" },
    "trap-t",
    "manual",
    "manual-operation",
    "trapezoid-top",
    "inv-trapezoid",
  ),
  ...names({ kind: "parallel" }, "fork", "join", "parallel"),
  ...names(
    { kind: "loopStart" },
    "loop-start",
    "notch-pent",
    "loop-limit",
    "notched-pentagon",
  ),
  ...names({ kind: "loopEnd" }, "loop-end"),
  ...names({ kind: "transfer" }, "tri", "extract", "triangle", "transfer"),
  ...names({ kind: "comment" }, "brace", "brace-l", "brace-r", "comment"),
  ...names(
    { kind: "process", stack: 3 },
    "st-rect",
    "procs",
    "processes",
    "stacked-rectangle",
  ),
  ...names(
    { kind: "process", striped: true },
    "div-rect",
    "div-proc",
    "divided-rectangle",
    "divided-process",
  ),
]);
