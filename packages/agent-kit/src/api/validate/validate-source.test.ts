import { describe, expect, it } from "vitest";

import { validateSource } from "./validate-source";

describe("validateSource", () => {
  it("counts what a valid diagram holds", () => {
    const result = validateSource(
      [
        "flowchart TD",
        'a(["Start"]) --> b{"Ok?"}',
        "subgraph s [Part]",
        '  c["Work"]',
        "end",
        "b -->|Yes| c",
      ].join("\n"),
    );

    expect(result).toEqual({ ok: true, blocks: 3, lines: 2, frames: 1 });
  });

  it("reports the first problem with its line", () => {
    const result = validateSource(
      'flowchart TD\na["x"] --> b\nstyle a fill:#f00',
    );

    expect(result).toEqual({
      ok: false,
      line: 3,
      message: 'Line 3: "style" is not supported yet',
    });
  });

  it("rejects other diagram types, skipping comments before the header", () => {
    expect(validateSource("%% note\n\nsequenceDiagram\nA->>B: hi")).toEqual({
      ok: false,
      line: 3,
      message: 'Line 3: Diagram type "sequenceDiagram" is not supported yet',
    });
  });

  it("says so when there is nothing to read", () => {
    expect(validateSource("  \n%% only a comment\n")).toMatchObject({
      ok: false,
      message: expect.stringContaining("empty") as unknown,
    });
  });
});
