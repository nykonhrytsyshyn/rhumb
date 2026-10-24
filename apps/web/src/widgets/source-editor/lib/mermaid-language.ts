import { StreamLanguage, type StreamParser } from "@codemirror/language";

interface MermaidState {
  quoted: boolean;
}

const ARROW = /-{2,}>|-{3,}|={2,}>|={3,}|-\.+->|-\.+-/;
const SHAPE_BRACKET = new RegExp(
  [
    "@\\{",
    "\\[=\\]",
    "\\[~~|~~\\]",
    "\\(\\[|\\]\\)",
    "\\[\\[|\\]\\]",
    "\\[\\/|\\/\\]",
    "\\[\\\\|\\\\\\]",
    "\\(\\(|\\)\\)",
    "\\{\\{|\\}\\}",
    "\\[\\(|\\)\\]",
    "\\[\\)|\\(\\]",
    "\\[[#~^:*]|[#~^:*]\\]",
    "\\([@=>]|[@=>]\\)",
    "\\{[\\^_]|[\\^_]\\}",
    "[[\\]{}()]",
  ].join("|"),
);
const PROPERTY = /(?:shape|label|ident|desc|input|ref|stack|loop)(?=\s*:)/;

/** Token parser for the supported flowchart subset of Mermaid. */
export const mermaidStreamParser: StreamParser<MermaidState> = {
  name: "mermaid-flowchart",

  startState: () => ({ quoted: false }),

  token(stream, state) {
    if (state.quoted) {
      while (!stream.eol()) {
        if (stream.next() === '"') {
          state.quoted = false;
          break;
        }
      }

      return "string";
    }

    if (stream.eatSpace()) {
      return null;
    }

    if (stream.match(/%%.*/)) {
      return "comment";
    }

    if (stream.sol() && stream.match(/(?:flowchart|graph)\b/)) {
      return "keyword";
    }

    if (stream.match(/\b(?:subgraph|end)\b/)) {
      return "keyword";
    }

    if (stream.match(PROPERTY)) {
      return "propertyName";
    }

    if (stream.match(/\b(?:TD|TB|BT|LR|RL)\b/)) {
      return "atom";
    }

    if (stream.match(ARROW)) {
      return "operator";
    }

    if (stream.match(/\|[^|]*\|/)) {
      return "string";
    }

    if (stream.eat('"')) {
      state.quoted = true;

      while (!stream.eol()) {
        if (stream.next() === '"') {
          state.quoted = false;
          break;
        }
      }

      return "string";
    }

    if (stream.match(SHAPE_BRACKET)) {
      return "bracket";
    }

    if (stream.match(/[\p{L}\p{N}_]+/u)) {
      return "variableName";
    }

    stream.next();

    return null;
  },
};

export const mermaidLanguage = StreamLanguage.define(mermaidStreamParser);
