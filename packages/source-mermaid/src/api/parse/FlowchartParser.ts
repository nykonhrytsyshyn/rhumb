import {
  type DiagramEdge,
  type DiagramNode,
  type DiagramParser,
  DiagramSyntaxError,
  type Direction,
  type FlowchartDiagram,
  type LineStyle,
} from "@rhumb/kernel";

import { LineScanner } from "../../internal/LineScanner";
import { SHAPE_DELIMITERS } from "../../internal/shapes";

const HEADER = /^(?:flowchart|graph)(?:\s+(TD|TB|BT|RL|LR))?$/;
const NODE_ID = /[\p{L}\p{N}_]+/u;
const LINK_LABEL = /\|([^|]*)\|/;

interface NodeRef {
  readonly id: string;
}

interface LinkToken {
  readonly line: LineStyle;
  readonly arrow: boolean;
  readonly label: string | undefined;
}

/**
 * Parses the flowchart subset of Mermaid that maps onto standard block
 * diagrams: node shapes, labeled links and chains of statements.
 */
export class FlowchartParser implements DiagramParser<FlowchartDiagram> {
  public parse(source: string): FlowchartDiagram {
    const statements = FlowchartParser.toStatements(source);
    const header = statements[0];

    if (header === undefined) {
      throw new DiagramSyntaxError("Empty diagram", 1);
    }

    const direction = FlowchartParser.parseHeader(header.text, header.line);
    const nodes = new Map<string, DiagramNode>();
    const edges: DiagramEdge[] = [];

    for (const statement of statements.slice(1)) {
      this.parseStatement(statement.text, statement.line, nodes, edges);
    }

    return {
      type: "flowchart",
      direction,
      nodes: [...nodes.values()],
      edges,
    };
  }

  private static toStatements(
    source: string,
  ): readonly { text: string; line: number }[] {
    const result: { text: string; line: number }[] = [];

    source.split(/\r?\n/).forEach((raw, index) => {
      const commentAt = raw.indexOf("%%");
      const withoutComment = commentAt === -1 ? raw : raw.slice(0, commentAt);

      for (const part of withoutComment.split(";")) {
        const text = part.trim();

        if (text.length > 0) {
          result.push({ text, line: index + 1 });
        }
      }
    });

    return result;
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

  private parseStatement(
    text: string,
    line: number,
    nodes: Map<string, DiagramNode>,
    edges: DiagramEdge[],
  ): void {
    if (/^(subgraph|end|classDef|class|style|linkStyle|click)\b/.test(text)) {
      throw new DiagramSyntaxError(
        `"${text.split(" ")[0] ?? text}" is not supported yet`,
        line,
      );
    }

    const scanner = new LineScanner(text, line);
    let previous = this.parseNode(scanner, nodes);

    while (!scanner.atEnd) {
      const link = FlowchartParser.parseLink(scanner);
      const next = this.parseNode(scanner, nodes);

      edges.push({
        id: `e${String(edges.length)}`,
        from: previous.id,
        to: next.id,
        label: link.label,
        line: link.line,
        arrow: link.arrow,
      });

      previous = next;
    }
  }

  private parseNode(
    scanner: LineScanner,
    nodes: Map<string, DiagramNode>,
  ): NodeRef {
    scanner.skipSpaces();
    const idMatch = scanner.match(NODE_ID);

    if (idMatch === undefined) {
      scanner.fail("Expected a node identifier");
    }

    const id = idMatch[0];
    const delimiters = SHAPE_DELIMITERS.find((candidate) =>
      scanner.startsWith(candidate.open),
    );

    if (delimiters === undefined) {
      if (!nodes.has(id)) {
        nodes.set(id, { id, kind: "process", label: id });
      }

      return { id };
    }

    scanner.consume(delimiters.open);

    const label = FlowchartParser.normalizeLabel(
      scanner.readUntil(delimiters.close),
    );

    nodes.set(id, { id, kind: delimiters.kind, label });

    return { id };
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
}
