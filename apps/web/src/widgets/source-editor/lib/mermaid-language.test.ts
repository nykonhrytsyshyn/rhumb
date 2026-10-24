import { StringStream } from "@codemirror/language";
import { describe, expect, it } from "vitest";

import { mermaidStreamParser } from "./mermaid-language";

function tokenize(line: string, quoted = false) {
  const state = { quoted };
  const stream = new StringStream(line, 2, 2);
  const tokens: [string, string | null][] = [];

  while (!stream.eol()) {
    stream.start = stream.pos;
    const type = mermaidStreamParser.token(stream, state);
    const text = line.slice(stream.start, stream.pos);

    if (type !== null) {
      tokens.push([text, type]);
    }
  }

  return { tokens, state };
}

describe("mermaid stream parser", () => {
  it("highlights the header and direction", () => {
    expect(tokenize("flowchart TD").tokens).toEqual([
      ["flowchart", "keyword"],
      ["TD", "atom"],
    ]);
  });

  it("splits nodes, shapes, links and labels", () => {
    expect(tokenize('A([Go]) -->|Yes| B{"x > 0"}').tokens).toEqual([
      ["A", "variableName"],
      ["([", "bracket"],
      ["Go", "variableName"],
      ["])", "bracket"],
      ["-->", "operator"],
      ["|Yes|", "string"],
      ["B", "variableName"],
      ["{", "bracket"],
      ['"x > 0"', "string"],
      ["}", "bracket"],
    ]);
  });

  it("splits the short forms of the other blocks", () => {
    expect(tokenize("A[~Doc~] --> B[=] --> C{^i^}").tokens).toEqual([
      ["A", "variableName"],
      ["[~", "bracket"],
      ["Doc", "variableName"],
      ["~]", "bracket"],
      ["-->", "operator"],
      ["B", "variableName"],
      ["[=]", "bracket"],
      ["-->", "operator"],
      ["C", "variableName"],
      ["{^", "bracket"],
      ["i", "variableName"],
      ["^}", "bracket"],
    ]);
  });

  it("marks frames and the properties of a block", () => {
    expect(tokenize("subgraph S").tokens[0]).toEqual(["subgraph", "keyword"]);
    expect(tokenize("end").tokens).toEqual([["end", "keyword"]]);
    expect(tokenize('A@{ shape: doc, ref: "X" }').tokens).toEqual([
      ["A", "variableName"],
      ["@{", "bracket"],
      ["shape", "propertyName"],
      ["doc", "variableName"],
      ["ref", "propertyName"],
      ['"X"', "string"],
      ["}", "bracket"],
    ]);
  });

  it("marks comments", () => {
    expect(tokenize("A --> B %% note").tokens.at(-1)).toEqual([
      "%% note",
      "comment",
    ]);
  });

  it("recognises dashed and thick links", () => {
    const types = tokenize("A -.-> B ==> C --- D")
      .tokens.filter(([, type]) => type === "operator")
      .map(([text]) => text);
    expect(types).toEqual(["-.->", "==>", "---"]);
  });

  it("continues a quoted string over several lines", () => {
    const first = tokenize('A["one');

    expect(first.state.quoted).toBe(true);

    const second = tokenize('two"] --> B', true);

    expect(second.state.quoted).toBe(false);
    expect(second.tokens[0]).toEqual(['two"', "string"]);
  });

  it("skips unknown characters", () => {
    expect(tokenize("@").tokens).toEqual([]);
  });
});
