export interface Statement {
  readonly text: string;
  /** The line the statement starts on. */
  readonly line: number;
}

/**
 * Splits the source into statements: one per line, or several on a line when
 * separated by `;`. Comments (`%%`) and `;` are ignored inside quotes, and a
 * `@{ ... }` block may run over several lines.
 */
export function toStatements(source: string): readonly Statement[] {
  const result: Statement[] = [];
  let text = "";
  let line = 1;
  let startLine = 1;
  let quoted = false;
  let props = false;
  let started = false;

  const flush = (): void => {
    const trimmed = text.trim();

    if (trimmed.length > 0) {
      result.push({ text: trimmed, line: startLine });
    }

    text = "";
    started = false;
  };

  for (let at = 0; at < source.length; at += 1) {
    const char = source.charAt(at);

    if (char === "\r") {
      continue;
    }

    if (char === "\n") {
      line += 1;
      quoted = false;

      if (props) {
        text += ", ";
      } else {
        flush();
      }

      continue;
    }

    if (!quoted) {
      if (char === "%" && source.charAt(at + 1) === "%") {
        const end = source.indexOf("\n", at);

        at = end === -1 ? source.length : end - 1;

        continue;
      }

      if (char === ";" && !props) {
        flush();

        continue;
      }

      if (char === "@" && source.charAt(at + 1) === "{") {
        props = true;
      } else if (char === "}" && props) {
        props = false;
      }
    }

    if (!started && char !== " " && char !== "\t") {
      startLine = line;
      started = true;
    }

    if (char === '"') {
      quoted = !quoted;
    }

    text += char;
  }

  flush();

  return result;
}
