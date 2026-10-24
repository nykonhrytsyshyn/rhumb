import {
  type DiagramEdge,
  type DiagramGroup,
  type DiagramNode,
  type DiagramParser,
  DiagramSyntaxError,
  type Direction,
  type FlowchartDiagram,
  type LineStyle,
  type NodeKind,
  type NoteSide,
} from "@rhumb/kernel";

import { LineScanner } from "../../internal/LineScanner";
import { type NodeProps, readProps } from "../../internal/props";
import {
  SHAPE_DELIMITERS,
  SHAPE_NAMES,
  type ShapeName,
} from "../../internal/shapes";
import { toStatements } from "../../internal/statements";

const HEADER = /^(?:flowchart|graph)(?:\s+(TD|TB|BT|RL|LR))?$/;
const NODE_ID = /[\p{L}\p{N}_]+/u;
const LINK_LABEL = /\|([^|]*)\|/;
const SUBGRAPH = /^subgraph\s+([\p{L}\p{N}_]+)(?:\s*\[(.*)\])?$/u;
const UNSUPPORTED = /^(classDef|class|style|linkStyle|click|direction)\b/;
const SKIP_LABELS = new Set(["...", "…"]);
const CHANNEL_LABEL = "~";
const NOTE_SIDES: ReadonlySet<string> = new Set([
  "right",
  "left",
  "top",
  "bottom",
]);
const MAX_STACK = 8;

/** Kinds that cannot carry a stripe or overlapping copies. */
const PLAIN_KINDS: ReadonlySet<NodeKind> = new Set([
  "parallel",
  "comment",
  "transfer",
  "connector",
]);

/** Kinds that draw no text of their own. */
const TEXTLESS_KINDS: ReadonlySet<NodeKind> = new Set(["parallel"]);

interface NodeRef {
  readonly id: string;
  /** The reference names a frame, not a block. */
  readonly frame: boolean;
}

interface LinkToken {
  readonly line: LineStyle;
  readonly arrow: boolean;
  readonly label: string | undefined;
}

interface Written {
  readonly kind: NodeKind;
  readonly label: string;
  readonly stack?: number;
  readonly striped?: boolean;
}

/** What the parser has gathered while it reads the statements. */
interface Draft {
  readonly nodes: Map<string, DiagramNode>;
  readonly lines: Map<string, number>;
  readonly edges: DiagramEdge[];
  readonly edgeLines: number[];
  readonly groups: DiagramGroup[];
  readonly groupLines: Map<string, number>;
  /** Frames that are open at this point of the source, innermost last. */
  readonly open: string[];
}

/**
 * Parses the flowchart subset of Mermaid that maps onto standard block
 * diagrams: node shapes, labeled links, frames and chains of statements.
 */
export class FlowchartParser implements DiagramParser<FlowchartDiagram> {
  public parse(source: string): FlowchartDiagram {
    const statements = toStatements(source);
    const header = statements[0];

    if (header === undefined) {
      throw new DiagramSyntaxError("Empty diagram", 1);
    }

    const direction = FlowchartParser.parseHeader(header.text, header.line);
    const draft: Draft = {
      nodes: new Map(),
      lines: new Map(),
      edges: [],
      edgeLines: [],
      groups: [],
      groupLines: new Map(),
      open: [],
    };

    for (const statement of statements.slice(1)) {
      this.parseStatement(statement.text, statement.line, draft);
    }

    const unclosed = draft.open.at(-1);

    if (unclosed !== undefined) {
      throw new DiagramSyntaxError(
        `Missing "end" for the subgraph "${unclosed}"`,
        draft.groupLines.get(unclosed) ?? 1,
      );
    }

    return {
      type: "flowchart",
      direction,
      nodes: [...draft.nodes.values()],
      edges: FlowchartParser.checkedEdges(draft),
      groups: draft.groups,
    };
  }

  private static parseHeader(text: string, line: number): Direction {
    const match = HEADER.exec(text);

    if (match === null) {
      throw new DiagramSyntaxError(
        'Expected "flowchart" or "graph" followed by a direction',
        line,
      );
    }

    return FlowchartParser.toDirection(match[1]);
  }

  private static toDirection(raw: string | undefined): Direction {
    switch (raw) {
      case "BT":
        return "BT";
      case "RL":
        return "RL";
      case "LR":
        return "LR";
      default:
        return "TB";
    }
  }

  private parseStatement(text: string, line: number, draft: Draft): void {
    if (UNSUPPORTED.test(text)) {
      throw new DiagramSyntaxError(
        `"${text.split(/\s/)[0] ?? text}" is not supported yet`,
        line,
      );
    }

    if (text === "end") {
      this.closeGroup(draft, line);

      return;
    }

    if (/^subgraph\b/.test(text)) {
      this.openGroup(text, line, draft);

      return;
    }

    const scanner = new LineScanner(text, line);
    let previous = this.parseNode(scanner, line, draft);

    while (!scanner.atEnd) {
      const link = FlowchartParser.parseLink(scanner);
      const next = this.parseNode(scanner, line, draft);
      const skip = link.label !== undefined && SKIP_LABELS.has(link.label);
      const channel = link.label === CHANNEL_LABEL;

      draft.edges.push({
        id: `e${String(draft.edges.length)}`,
        from: previous.id,
        to: next.id,
        label: skip || channel ? undefined : link.label,
        line: link.line,
        arrow: link.arrow,
        skip,
        channel,
      });
      draft.edgeLines.push(line);

      previous = next;
    }
  }

  private openGroup(text: string, line: number, draft: Draft): void {
    const match = SUBGRAPH.exec(text);

    if (match?.[1] === undefined) {
      throw new DiagramSyntaxError(
        'Expected a frame such as: subgraph name ["Title"]',
        line,
      );
    }

    const id = match[1];

    if (draft.nodes.has(id) || draft.groupLines.has(id)) {
      throw new DiagramSyntaxError(`"${id}" is already in use`, line);
    }

    const raw = (match[2] ?? "").trim();
    const title = FlowchartParser.normalizeLabel(
      raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2
        ? raw.slice(1, -1)
        : raw,
    );

    draft.groups.push({
      id,
      title: title === "" ? undefined : title,
      parent: draft.open.at(-1),
    });
    draft.groupLines.set(id, line);
    draft.open.push(id);
  }

  private closeGroup(draft: Draft, line: number): void {
    if (draft.open.pop() === undefined) {
      throw new DiagramSyntaxError('"end" without a subgraph', line);
    }
  }

  private parseNode(scanner: LineScanner, line: number, draft: Draft): NodeRef {
    scanner.skipSpaces();
    const idMatch = scanner.match(NODE_ID);

    if (idMatch === undefined) {
      scanner.fail("Expected a node identifier");
    }

    const id = idMatch[0];
    const written = FlowchartParser.readShape(scanner);

    scanner.skipSpaces();

    const props = scanner.startsWith("@{") ? readProps(scanner) : undefined;

    if (draft.groupLines.has(id)) {
      if (written !== undefined || props !== undefined) {
        scanner.fail(`"${id}" is a frame; it cannot be given a shape`);
      }

      return { id, frame: true };
    }

    const node = FlowchartParser.buildNode(
      id,
      written,
      props,
      draft.nodes.get(id),
      line,
    );

    draft.nodes.set(id, FlowchartParser.placed(node, draft, line));

    if (!draft.lines.has(id)) {
      draft.lines.set(id, line);
    }

    return { id, frame: false };
  }

  /** A block belongs to the frame it is first named in. */
  private static placed(
    node: DiagramNode,
    draft: Draft,
    line: number,
  ): DiagramNode {
    const current = draft.open.at(-1);

    if (current === undefined) {
      return node;
    }

    if (node.group !== undefined) {
      if (FlowchartParser.within(draft, node.group, current)) {
        return node;
      }

      if (FlowchartParser.within(draft, current, node.group)) {
        return node;
      }

      throw new DiagramSyntaxError(
        `"${node.id}" is already in the frame "${node.group}"`,
        line,
      );
    }

    return { ...node, group: current };
  }

  /** Whether `inner` is `outer` or sits somewhere inside it. */
  private static within(draft: Draft, inner: string, outer: string): boolean {
    for (
      let id: string | undefined = inner;
      id !== undefined;
      id = draft.groups.find((group) => group.id === id)?.parent
    ) {
      if (id === outer) {
        return true;
      }
    }

    return false;
  }

  /** Reads a bracketed shape such as `[text]` or `[~text~]`, if there is one. */
  private static readShape(scanner: LineScanner): Written | undefined {
    const delimiters =
      SHAPE_DELIMITERS.find(
        (candidate) =>
          scanner.startsWith(candidate.open) &&
          (candidate.close === "" ||
            scanner.closes(
              candidate.open,
              candidate.close,
              candidate.shortcut === true,
            )),
      ) ??
      // Nothing closes: take the plain bracket so the error says what is missing.
      SHAPE_DELIMITERS.find(
        (candidate) =>
          candidate.shortcut !== true &&
          candidate.close !== "" &&
          scanner.startsWith(candidate.open),
      );

    if (delimiters === undefined) {
      return undefined;
    }

    scanner.consume(delimiters.open);

    if (delimiters.close === "") {
      return { kind: delimiters.kind, label: "" };
    }

    return {
      kind: delimiters.kind,
      label: FlowchartParser.normalizeLabel(
        scanner.readUntil(delimiters.close),
      ),
    };
  }

  private static buildNode(
    id: string,
    written: Written | undefined,
    props: NodeProps | undefined,
    existing: DiagramNode | undefined,
    line: number,
  ): DiagramNode {
    if (written === undefined && props === undefined) {
      return existing ?? { id, kind: "process", label: id };
    }

    if (written !== undefined && props?.shape !== undefined) {
      throw new DiagramSyntaxError(
        `"${id}" is given a shape twice: in brackets and in @{ shape: ... }`,
        line,
      );
    }

    const named = FlowchartParser.named(props?.shape, line);
    const shape: Written | ShapeName | undefined = written ?? named;
    const kind = shape?.kind ?? existing?.kind ?? "process";
    const label = TEXTLESS_KINDS.has(kind)
      ? ""
      : (written?.label ?? props?.label ?? existing?.label ?? id);
    const stack =
      FlowchartParser.stackOf(props?.stack, line) ??
      (written === undefined ? named?.stack : undefined) ??
      existing?.stack;
    const ref =
      props?.ref ?? (named?.striped === true ? "" : undefined) ?? existing?.ref;
    const side = FlowchartParser.sideOf(
      kind,
      props?.side ?? existing?.side,
      line,
    );
    const legend = FlowchartParser.legendOf(
      kind,
      props?.legend ?? existing?.legend,
      line,
    );
    const loop = FlowchartParser.loopOf(
      kind,
      label,
      props?.loop,
      existing?.loop,
      line,
    );

    if (PLAIN_KINDS.has(kind) && (stack !== undefined || ref !== undefined)) {
      throw new DiagramSyntaxError(
        `"${id}" cannot carry a stripe or copies: ref and stack do not apply to this block`,
        line,
      );
    }

    return {
      id,
      kind,
      label,
      ...FlowchartParser.optional("ident", props?.ident ?? existing?.ident),
      ...FlowchartParser.optional("desc", props?.desc ?? existing?.desc),
      ...FlowchartParser.optional("input", props?.input ?? existing?.input),
      ...FlowchartParser.optional("ref", ref),
      ...(stack === undefined || stack < 2 ? {} : { stack }),
      ...FlowchartParser.optional("loop", loop),
      ...FlowchartParser.optional("legend", legend),
      ...(side === undefined ? {} : { side }),
      ...(existing?.group === undefined ? {} : { group: existing.group }),
    };
  }

  private static optional(
    key: "ident" | "desc" | "input" | "ref" | "loop" | "legend",
    value: string | undefined,
  ): Partial<Record<typeof key, string>> {
    return value === undefined ? {} : { [key]: value };
  }

  private static named(
    name: string | undefined,
    line: number,
  ): ShapeName | undefined {
    if (name === undefined) {
      return undefined;
    }

    const shape = SHAPE_NAMES.get(name);

    if (shape === undefined) {
      throw new DiagramSyntaxError(
        `Unknown shape "${name}": it is not a block of the standard`,
        line,
      );
    }

    return shape;
  }

  private static sideOf(
    kind: NodeKind,
    raw: string | undefined,
    line: number,
  ): NoteSide | undefined {
    if (raw === undefined) {
      return undefined;
    }

    if (kind !== "comment") {
      throw new DiagramSyntaxError("side belongs to comments only", line);
    }

    if (!NOTE_SIDES.has(raw)) {
      throw new DiagramSyntaxError(
        "side must be right, left, top or bottom",
        line,
      );
    }

    return raw as NoteSide;
  }

  private static legendOf(
    kind: NodeKind,
    raw: string | undefined,
    line: number,
  ): string | undefined {
    if (raw !== undefined && kind !== "transfer") {
      throw new DiagramSyntaxError(
        "legend belongs to transfers of control only",
        line,
      );
    }

    return raw;
  }

  private static stackOf(
    raw: string | undefined,
    line: number,
  ): number | undefined {
    if (raw === undefined) {
      return undefined;
    }

    const count = Number(raw);

    if (!Number.isInteger(count) || count < 1 || count > MAX_STACK) {
      throw new DiagramSyntaxError(
        `stack must be a whole number from 1 to ${String(MAX_STACK)}`,
        line,
      );
    }

    return count;
  }

  /** The name that joins the two parts of a loop limit. */
  private static loopOf(
    kind: NodeKind,
    label: string,
    explicit: string | undefined,
    existing: string | undefined,
    line: number,
  ): string | undefined {
    if (kind !== "loopStart" && kind !== "loopEnd") {
      if (explicit !== undefined) {
        throw new DiagramSyntaxError(
          "loop belongs to the loop blocks only",
          line,
        );
      }

      return undefined;
    }

    const derived = (label.split("\n")[0] ?? "").split(":")[0]?.trim() ?? "";
    const name = (explicit ?? existing ?? derived).trim();

    if (name === "") {
      throw new DiagramSyntaxError(
        "A loop block needs a name, such as {^i: i = 1..n^}",
        line,
      );
    }

    return name;
  }

  private static parseLink(scanner: LineScanner): LinkToken {
    scanner.skipSpaces();

    const labelled = scanner.matchLabelled();

    if (labelled !== undefined) {
      return {
        ...FlowchartParser.describe(labelled.opener, labelled.closer),
        label: FlowchartParser.normalizeLabel(labelled.label),
      };
    }

    const token = scanner.matchLink();

    if (token === undefined) {
      scanner.fail("Expected a link such as -->");
    }

    const described = FlowchartParser.describe(token, token);
    const label = scanner.match(LINK_LABEL);

    return {
      ...described,
      label:
        label === undefined
          ? undefined
          : FlowchartParser.normalizeLabel(label[1] ?? ""),
    };
  }

  private static describe(
    opener: string,
    closer: string,
  ): Pick<LinkToken, "arrow" | "line"> {
    const arrow = closer.endsWith(">");

    return opener.startsWith("==")
      ? { line: "thick", arrow }
      : opener.includes(".") || closer.includes(".")
        ? { line: "dashed", arrow }
        : { line: "solid", arrow };
  }

  private static normalizeLabel(raw: string): string {
    return raw
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\\n/g, "\n")
      .trim();
  }

  /**
   * Checks what only the whole diagram can tell: that comments and frames are
   * linked properly, that frames hold something and that loops are closed.
   * Lines of a comment are always dashed and have no arrow.
   */
  private static checkedEdges(draft: Draft): readonly DiagramEdge[] {
    const kindOf = (id: string): NodeKind | undefined =>
      draft.nodes.get(id)?.kind;
    const frames = new Set(draft.groups.map((group) => group.id));
    const links = new Map<string, number>();

    const edges = draft.edges.map((edge, index): DiagramEdge => {
      const line = draft.edgeLines[index] ?? 1;
      const noted = [edge.from, edge.to].filter(
        (id) => kindOf(id) === "comment",
      );
      const framed = [edge.from, edge.to].some((id) => frames.has(id));

      if (noted.length === 2) {
        throw new DiagramSyntaxError(
          "A comment cannot be linked to another comment",
          line,
        );
      }

      if (framed && noted.length === 0) {
        throw new DiagramSyntaxError(
          "Only a comment can be linked to a frame",
          line,
        );
      }

      const [note] = noted;

      if (note === undefined) {
        return edge;
      }

      if (edge.label !== undefined || edge.skip || edge.channel) {
        throw new DiagramSyntaxError(
          "The link of a comment takes no label",
          line,
        );
      }

      links.set(note, (links.get(note) ?? 0) + 1);

      return { ...edge, line: "dashed", arrow: false };
    });

    for (const node of draft.nodes.values()) {
      const line = draft.lines.get(node.id) ?? 1;

      if (node.kind === "comment" && links.get(node.id) !== 1) {
        throw new DiagramSyntaxError(
          links.has(node.id)
            ? `The comment "${node.id}" is linked more than once`
            : `The comment "${node.id}" is not linked to a block or a frame`,
          line,
        );
      }
    }

    FlowchartParser.checkLegends(draft);
    FlowchartParser.checkFrames(draft);
    FlowchartParser.checkLoops(draft);

    return edges;
  }

  /** One letter cannot stand for two things in the legend. */
  private static checkLegends(draft: Draft): void {
    const meanings = new Map<string, string>();

    for (const node of draft.nodes.values()) {
      if (node.kind !== "transfer" || node.legend === undefined) {
        continue;
      }

      const known = meanings.get(node.label);

      if (known !== undefined && known !== node.legend) {
        throw new DiagramSyntaxError(
          `"${node.label}" already stands for "${known}" in the legend`,
          draft.lines.get(node.id) ?? 1,
        );
      }

      meanings.set(node.label, node.legend);
    }
  }

  private static checkFrames(draft: Draft): void {
    const holders = new Set<string>();
    const parents = new Map(
      draft.groups.map((group) => [group.id, group.parent] as const),
    );

    for (const node of draft.nodes.values()) {
      if (node.kind === "comment") {
        continue;
      }

      for (
        let id = node.group;
        id !== undefined && !holders.has(id);
        id = parents.get(id)
      ) {
        holders.add(id);
      }
    }

    for (const group of draft.groups) {
      if (!holders.has(group.id)) {
        throw new DiagramSyntaxError(
          `The frame "${group.id}" holds no blocks`,
          draft.groupLines.get(group.id) ?? 1,
        );
      }
    }
  }

  private static checkLoops(draft: Draft): void {
    const balance = new Map<string, number>();

    for (const node of draft.nodes.values()) {
      if (node.loop === undefined) {
        continue;
      }

      const step = node.kind === "loopStart" ? 1 : -1;

      balance.set(node.loop, (balance.get(node.loop) ?? 0) + step);
    }

    for (const [name, difference] of balance) {
      if (difference === 0) {
        continue;
      }

      const wanted = difference > 0 ? "loopEnd" : "loopStart";
      const lonely = [...draft.nodes.values()].find(
        (node) =>
          node.loop === name &&
          node.kind === (difference > 0 ? "loopStart" : "loopEnd"),
      );

      throw new DiagramSyntaxError(
        `The loop "${name}" has no ${wanted === "loopEnd" ? "end" : "start"} to match`,
        draft.lines.get(lonely?.id ?? "") ?? 1,
      );
    }
  }
}
