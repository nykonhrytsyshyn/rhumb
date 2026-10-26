import { DiagramSyntaxError } from "@rhumb/kernel";
import { FlowchartParser } from "@rhumb/source-mermaid";

export interface ValidationSummary {
  readonly blocks: number;
  readonly lines: number;
  readonly frames: number;
}

export type ValidationResult =
  | ({ readonly ok: true } & ValidationSummary)
  | {
      readonly ok: false;
      readonly line: number;
      readonly message: string;
    };

const SUPPORTED_HEADER = /^(flowchart|graph)\b/;

function headerOf(source: string): {
  readonly text: string;
  readonly line: number;
} {
  const lines = source.split(/\r?\n/);
  const index = lines.findIndex(
    (line) => line.trim().length > 0 && !line.trim().startsWith("%%"),
  );

  return { text: lines[index]?.trim() ?? "", line: index + 1 };
}

export function validateSource(source: string): ValidationResult {
  const header = headerOf(source);

  if (!SUPPORTED_HEADER.test(header.text)) {
    const kind = header.text.split(/\s+/)[0] ?? "";
    const failure = new DiagramSyntaxError(
      kind === ""
        ? "The diagram is empty"
        : `Diagram type "${kind}" is not supported yet`,
      Math.max(header.line, 1),
    );

    return { ok: false, line: failure.line, message: failure.message };
  }

  try {
    const diagram = new FlowchartParser().parse(source);

    return {
      ok: true,
      blocks: diagram.nodes.length,
      lines: diagram.edges.length,
      frames: diagram.groups.length,
    };
  } catch (error) {
    if (error instanceof DiagramSyntaxError) {
      return { ok: false, line: error.line, message: error.message };
    }

    throw error;
  }
}
