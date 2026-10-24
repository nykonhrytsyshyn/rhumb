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
    expect(() => parser.parse("flowchart TD\nclassDef a fill:#fff")).toThrow(
      /not supported/,
    );
    expect(() => parser.parse("flowchart TD\nsubgraph S\nA")).toThrow(
      /Missing "end"/,
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
      if (!(error instanceof DiagramSyntaxError)) {
        throw error;
      }
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

describe("FlowchartParser block syntax", () => {
  const parser = new FlowchartParser();

  function kindOf(source: string): string | undefined {
    return parser.parse(`flowchart TD\n${source}`).nodes[0]?.kind;
  }

  it("reads the short forms of every standard block", () => {
    const forms: readonly (readonly [string, string])[] = [
      ["A[)x(]", "storedData"],
      ["A[#x#]", "internalStorage"],
      ["A(@x@)", "sequentialStorage"],
      ["A[(x)]", "directStorage"],
      ["A[~x~]", "document"],
      ["A[~~x~~]", "paperTape"],
      ["A[^x^]", "manualInput"],
      ["A[:x:]", "card"],
      ["A(=x=)", "display"],
      ["A[\\x/]", "manualOperation"],
      ["A[=]", "parallel"],
      ["A{^i: x^}", "loopStart"],
      ["A{_i_}", "loopEnd"],
      ["A(>x>)", "transfer"],
      ["A[*x*]", "comment"],
    ];

    for (const [form, kind] of forms) {
      const companion =
        kind === "comment"
          ? "\nB"
          : kind === "loopStart"
            ? "\nZ{_i_}"
            : kind === "loopEnd"
              ? "\nZ{^i^}"
              : "";
      const link = kind === "comment" ? `${form} -.- B` : form;
      const found = parser
        .parse(`flowchart TD\n${link}${companion}`)
        .nodes.find((node) => node.id === "A");

      expect(found?.kind, form).toBe(kind);
    }
  });

  it("keeps the old forms and tells slashes apart by their closer", () => {
    expect(kindOf("A[/x/]")).toBe("io");
    expect(kindOf("A[\\x\\]")).toBe("io");
    expect(kindOf("A[\\x/]")).toBe("manualOperation");
    expect(kindOf("A[x]")).toBe("process");
    expect(kindOf("A(x)")).toBe("terminator");
  });

  it("leaves a label that only starts like a short form as a process", () => {
    expect(kindOf("A[~x]")).toBe("process");
    expect(parser.parse("flowchart TD\nA[~x]").nodes[0]?.label).toBe("~x");
    expect(kindOf('A["~x~"]')).toBe("process");
    expect(
      parser.parse("flowchart TD\nA[~x] --> B[~y~]").nodes.map((n) => n.kind),
    ).toEqual(["process", "document"]);
  });

  it("reads Mermaid shape names and Rhumb aliases", () => {
    const shape = (name: string): string | undefined =>
      kindOf(`A@{ shape: ${name}, label: "x" }`);

    expect(shape("doc")).toBe("document");
    expect(shape("sl-rect")).toBe("manualInput");
    expect(shape("trap-t")).toBe("manualOperation");
    expect(shape("win-pane")).toBe("internalStorage");
    expect(shape("bow-rect")).toBe("storedData");
    expect(shape("h-cyl")).toBe("directStorage");
    expect(shape("notch-rect")).toBe("card");
    expect(shape("flag")).toBe("paperTape");
    expect(shape("curv-trap")).toBe("display");
    expect(shape("fork")).toBe("parallel");
    expect(() => shape("bolt")).toThrow(/Unknown shape/);
    expect(shape("tri")).toBe("transfer");
    expect(shape("seq-store")).toBe("sequentialStorage");
    expect(() => shape("hourglass")).toThrow(/Unknown shape "hourglass"/);
  });

  it("reads node properties and merges them into an existing block", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A[Process] --> B",
        'A@{ ref: "X84", ident: "P1", desc: "out" }',
        'B@{ shape: docs, label: "Reports", stack: 4 }',
      ].join("\n"),
    );

    expect(diagram.nodes[0]).toEqual({
      id: "A",
      kind: "process",
      label: "Process",
      ref: "X84",
      ident: "P1",
      desc: "out",
    });
    expect(diagram.nodes[1]).toMatchObject({
      kind: "document",
      label: "Reports",
      stack: 4,
    });
    expect(
      parser.parse("flowchart TD\nA@{ shape: docs }").nodes[0]?.stack,
    ).toBe(3);
  });

  it("reads properties spread over several lines and with a semicolon inside", () => {
    const diagram = parser.parse(
      'flowchart TD\nA@{\n  shape: doc\n  label: "a; b %% c"\n}\nB',
    );

    expect(diagram.nodes[0]).toMatchObject({
      kind: "document",
      label: "a; b %% c",
    });
    expect(diagram.nodes).toHaveLength(2);
  });

  it("keeps ; and %% inside quoted labels", () => {
    const [node] = parser.parse('flowchart TD\nA["x; y %% z"]').nodes;

    expect(node?.label).toBe("x; y %% z");
  });

  it("rejects wrong properties", () => {
    const bad =
      (body: string): (() => unknown) =>
      () =>
        parser.parse(`flowchart TD\nA@{ ${body} }`);

    expect(bad("size: 3")).toThrow(/Unknown key "size"/);
    expect(bad("stack: 0")).toThrow(/whole number/);
    expect(bad("loop: i")).toThrow(/loop blocks only/);
    expect(() => parser.parse("flowchart TD\nA[x]@{ shape: doc }")).toThrow(
      /shape twice/,
    );
    expect(() => parser.parse("flowchart TD\nA(>x>)@{ ref: r }")).toThrow(
      /cannot carry/,
    );
    expect(() => parser.parse("flowchart TD\nA@{ label: x")).toThrow(
      /Missing closing "}"/,
    );
  });

  it("pairs the parts of a loop by name", () => {
    const diagram = parser.parse(
      "flowchart TD\nA{^i: i=1..n^} --> B --> C{_i_}",
    );

    expect(diagram.nodes.map((node) => node.loop)).toEqual([
      "i",
      undefined,
      "i",
    ]);
    expect(() => parser.parse("flowchart TD\nA{^i: x^} --> B")).toThrow(
      /loop "i" has no end/,
    );
    expect(() => parser.parse("flowchart TD\nB --> C{_j_}")).toThrow(
      /loop "j" has no start/,
    );
    expect(
      parser
        .parse(
          'flowchart TD\nA@{ shape: loop-start, loop: "k", label: "x" } --> B@{ shape: loop-end, loop: "k" }',
        )
        .nodes.map((n) => n.loop),
    ).toEqual(["k", "k"]);
  });

  it("reads frames, nested frames and the blocks inside them", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A --> B",
        'subgraph outer ["Outer"]',
        "  B",
        "  subgraph inner",
        "    C --> D",
        "  end",
        "end",
        "D --> E",
      ].join("\n"),
    );

    expect(diagram.groups).toEqual([
      { id: "outer", title: "Outer", parent: undefined },
      { id: "inner", title: undefined, parent: "outer" },
    ]);
    expect(
      Object.fromEntries(diagram.nodes.map((node) => [node.id, node.group])),
    ).toEqual({
      A: undefined,
      B: "outer",
      C: "inner",
      D: "inner",
      E: undefined,
    });
    expect(() => parser.parse("flowchart TD\nsubgraph S\nend")).toThrow(
      /holds no blocks/,
    );
    expect(() => parser.parse("flowchart TD\nend")).toThrow(
      /without a subgraph/,
    );
    expect(() =>
      parser.parse("flowchart TD\nsubgraph S\nA\nend\nsubgraph T\nA\nend"),
    ).toThrow(/already in the frame "S"/);
  });

  it("links comments to blocks and frames as dashed lines without arrows", () => {
    const diagram = parser.parse(
      [
        "flowchart TD",
        "A --> B",
        "subgraph S",
        "  C",
        "end",
        "N1[*note*] --- A",
        "S ==> N2[*other*]",
      ].join("\n"),
    );
    const links = diagram.edges.filter(
      (edge) => edge.from !== "A" || edge.to !== "B",
    );

    expect(links).toHaveLength(2);
    expect(links.every((edge) => edge.line === "dashed" && !edge.arrow)).toBe(
      true,
    );
    expect(() => parser.parse("flowchart TD\nA\nN[*x*]")).toThrow(/not linked/);
    expect(() =>
      parser.parse("flowchart TD\nA --> B\nsubgraph S\nC\nend\nA -.- S"),
    ).toThrow(/Only a comment/);
    expect(() => parser.parse("flowchart TD\nA\nN[*x*] -->|why| A")).toThrow(
      /takes no label/,
    );
  });

  it("marks a line labelled with dots as an omission", () => {
    const [edge] = parser.parse("flowchart TD\nA -->|...| B").edges;

    expect(edge).toMatchObject({ skip: true, label: undefined });
  });

  it("marks a line labelled with a tilde as a communication link", () => {
    const [edge] = parser.parse("flowchart TD\nA -->|~| B").edges;

    expect(edge).toMatchObject({
      channel: true,
      skip: false,
      label: undefined,
    });
  });

  it("reads the side of a comment and refuses it elsewhere", () => {
    const diagram = parser.parse(
      "flowchart TD\nA\nN[*x*] @{ side: left } -.- A",
    );

    expect(diagram.nodes.find((node) => node.id === "N")?.side).toBe("left");
    expect(() => parser.parse("flowchart TD\nA@{ side: left }")).toThrow(
      /comments only/,
    );
    expect(() =>
      parser.parse("flowchart TD\nA\nN[*x*] @{ side: up } -.- A"),
    ).toThrow(/right, left, top or bottom/);
  });

  it("reads the legend of a transfer and keeps a letter to one meaning", () => {
    const diagram = parser.parse(
      'flowchart TD\nA(>P>) @{ legend: "permanent" } --> B(>P>)',
    );

    expect(diagram.nodes[0]).toMatchObject({
      kind: "transfer",
      legend: "permanent",
    });
    expect(() => parser.parse('flowchart TD\nA@{ legend: "x" }')).toThrow(
      /transfers of control only/,
    );
    expect(() =>
      parser.parse(
        'flowchart TD\nA(>P>) @{ legend: "a" } --> B(>P>) @{ legend: "b" }',
      ),
    ).toThrow(/already stands for "a"/);
  });
});
