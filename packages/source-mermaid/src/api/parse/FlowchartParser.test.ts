import { describe, expect, it } from "vitest";

import { DiagramSyntaxError } from "@rhumb/kernel";

import { FlowchartParser } from "./FlowchartParser";

const parser = new FlowchartParser();

describe("FlowchartParser", () => {
  it("reads the direction and treats TD as TB", () => {
    expect(parser.parse("flowchart TD\nA").direction).toBe("TB");
    expect(parser.parse("graph LR\nA").direction).toBe("LR");
    expect(parser.parse("flowchart BT\nA").direction).toBe("BT");
    expect(parser.parse("flowchart RL\nA").direction).toBe("RL");
    expect(parser.parse("flowchart\nA").direction).toBe("TB");
  });

  it("maps node shapes to semantic kinds", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "a([Start])",
        "b[Action]",
        "c{Condition?}",
        "d[/Input/]",
        "e[\\Output\\]",
        "f{{Preparation}}",
        "g[[Subprogram]]",
        "h((1))",
        "i(End)",
      ].join("\n"),
    );
    expect(diagram.nodes.map((node) => node.kind)).toEqual([
      "terminator",
      "process",
      "decision",
      "io",
      "io",
      "preparation",
      "predefinedProcess",
      "connector",
      "terminator",
    ]);
    expect(diagram.nodes[2]?.label).toBe("Condition?");
  });

  it("parses chained links with labels in every notation", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A --> B --> C",
        "C -->|Yes| D",
        "C -- No --> E",
        "E -.-> F",
        "F ==> G",
        "G --- H",
      ].join("\n"),
    );
    expect(
      diagram.edges.map((edge) => [edge.from, edge.to, edge.label]),
    ).toEqual([
      ["A", "B", undefined],
      ["B", "C", undefined],
      ["C", "D", "Yes"],
      ["C", "E", "No"],
      ["E", "F", undefined],
      ["F", "G", undefined],
      ["G", "H", undefined],
    ]);
    expect(diagram.edges.map((edge) => edge.line)).toEqual([
      "solid",
      "solid",
      "solid",
      "solid",
      "dashed",
      "thick",
      "solid",
    ]);
    expect(diagram.edges.at(-1)?.arrow).toBe(false);
    expect(diagram.edges[0]?.arrow).toBe(true);
  });

  it("supports quoted labels, line breaks, comments and semicolons", () => {
    const diagram = parser.parse(
      'flowchart TD\nA["First<br/>line"]; B %% comment\nA --> B',
    );
    expect(diagram.nodes[0]?.label).toBe("First\nline");
    expect(diagram.nodes).toHaveLength(2);
    expect(diagram.edges).toHaveLength(1);
  });

  it("lets a later definition override the label and shape", () => {
    const diagram = parser.parse("flowchart TD\nA --> B\nA{Вопрос}");
    expect(diagram.nodes[0]).toEqual({
      id: "A",
      kind: "decision",
      label: "Вопрос",
    });
  });

  it("reports syntax problems with a line number", () => {
    expect(() => parser.parse("")).toThrow(DiagramSyntaxError);
    expect(() => parser.parse("sequenceDiagram")).toThrow(/Line 1/);
    expect(() => parser.parse("flowchart TD\nA[open")).toThrow(/Line 2/);
    expect(() => parser.parse("flowchart TD\nA -->")).toThrow(
      /Expected a node identifier/,
    );
    expect(() => parser.parse("flowchart TD\nA B")).toThrow(/Expected a link/);
    expect(() => parser.parse('flowchart TD\nA["x')).toThrow(/Unterminated/);
    expect(() => parser.parse('flowchart TD\nA["x" y]')).toThrow(
      /Expected "]"/,
    );
    expect(() => parser.parse("flowchart TD\nsubgraph S")).toThrow(
      /not supported/,
    );
  });
});

describe("FlowchartParser input hardening", () => {
  const BUDGET_MS = 500;

  function elapsed(source: string): number {
    const start = Date.now();

    try {
      parser.parse(source);
    } catch (error) {
      if (!(error instanceof DiagramSyntaxError)) throw error;
    }

    return Date.now() - start;
  }

  it("strips comments in linear time even with many '%%' and a bare CR", () => {
    expect(
      elapsed(`flowchart TD\nA-->B ${"%%".repeat(20_000)}\r x`),
    ).toBeLessThan(BUDGET_MS);
  });

  it("rejects a long run of spaces after a link opener in linear time", () => {
    for (const tail of ["", "a"]) {
      expect(
        elapsed(`flowchart TD\nA --${" ".repeat(50_000)}${tail}`),
      ).toBeLessThan(BUDGET_MS);
    }
  });

  it("rejects long runs of dots, dashes and equals signs in linear time", () => {
    const runs = [".", "-", "=", "-.", ". "].map((unit) => unit.repeat(50_000));

    for (const run of runs) {
      expect(elapsed(`flowchart TD\nA -- x ${run}`)).toBeLessThan(BUDGET_MS);
      expect(elapsed(`flowchart TD\nA -${run}`)).toBeLessThan(BUDGET_MS);
      expect(elapsed(`flowchart TD\nA ${run} B`)).toBeLessThan(BUDGET_MS);
    }
  });

  it("keeps parsing every link style", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A --> B",
        "B --- C",
        "C ==> D",
        "D === E",
        "E -.-> F",
        "F -..-> G",
        "G -.- H",
        "H --->|yes| I",
      ].join("\n"),
    );

    expect(
      diagram.edges.map(({ line, arrow }) => `${line}:${String(arrow)}`),
    ).toEqual([
      "solid:true",
      "solid:false",
      "thick:true",
      "thick:false",
      "dashed:true",
      "dashed:true",
      "dashed:false",
      "solid:true",
    ]);
  });

  it("keeps parsing labelled links, including embedded dashes", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A -- some -- text --> B",
        "C == hi ==> D",
        "E -. maybe .-> F",
      ].join("\n"),
    );

    expect(diagram.edges.map((edge) => edge.label)).toEqual([
      "some -- text",
      "hi",
      "maybe",
    ]);
  });
});
