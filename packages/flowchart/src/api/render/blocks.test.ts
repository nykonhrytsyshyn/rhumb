import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import {
  ApproximateTextMeasurer,
  type LayoutEngine,
  type LayoutResult,
  type Rect,
  type SvgNode,
} from "@rhumb/kernel";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import { ProfileRegistry } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { FlowchartRenderer } from "./FlowchartRenderer";

function descendants(node: SvgNode): readonly SvgNode[] {
  return [
    node,
    ...node.children.flatMap((child) =>
      typeof child === "string" ? [] : descendants(child),
    ),
  ];
}

function texts(node: SvgNode): readonly string[] {
  return descendants(node).flatMap((item) =>
    item.children.filter((child) => typeof child === "string"),
  );
}

async function render(source: string) {
  const profile = ProfileRegistry.withBuiltins().list()[0];

  if (profile === undefined) {
    throw new Error("Missing profile");
  }

  const elk = new ElkLayoutEngine(new ELK());
  let laid: LayoutResult | undefined;
  const engine: LayoutEngine = {
    layout: async (request) => {
      laid = await elk.layout(request);

      return laid;
    },
  };
  const result = await new FlowchartRenderer({
    profile,
    layoutEngine: engine,
    measurer: new ApproximateTextMeasurer(),
  }).render(new FlowchartParser().parse(source));

  return { result, nodes: descendants(result.svg), laid };
}

function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function corners(path: SvgNode): readonly (readonly [number, number])[] {
  return String(path.attrs.d)
    .split(/(?=[MLA])/)
    .map((command) => command.slice(1).trim().split(/[ ,]+/).map(Number))
    .map((numbers) => numbers.slice(-2))
    .map(([x, y]) => [x ?? 0, y ?? 0] as const);
}

const EVERY_BLOCK = [
  "flowchart TD",
  "S([Start]) --> A[)stored(]",
  "A --> B[#memory#]",
  "B --> C(@tape@)",
  "C --> D[(disk)]",
  "D --> E[~document~]",
  "E --> F[~~paper~~]",
  "F --> G[^keyboard^]",
  "G --> H[:card:]",
  "H --> I(=screen=)",
  "I --> J[\\hand/]",
  "J --> P[=]",
  "P --> K{^i: i=1..n^}",
  "K --> T(>P>)",
  "T -->|~| M{_i_}",
  "M --> Z([End])",
  "N[*note*] -.- A",
].join("\n");

describe("blocks of the standard", () => {
  it("renders every kind of block into one diagram", async () => {
    const { result, nodes } = await render(EVERY_BLOCK);
    const words = nodes.flatMap(texts).join(" ");

    for (const word of [
      "stored",
      "memory",
      "tape",
      "disk",
      "document",
      "paper",
      "keyboard",
      "card",
      "screen",
      "hand",
      "note",
    ]) {
      expect(words, word).toContain(word);
    }

    expect(result.size.width).toBeGreaterThan(0);
    expect(Number.isFinite(result.size.height)).toBe(true);
  });

  it("draws no text for the parallel bar and the communication link", async () => {
    const { nodes } = await render(
      "flowchart TD\nA --> P@{ shape: fork, label: hidden } --> B",
    );

    expect(nodes.flatMap(texts).join(" ")).not.toContain("hidden");
  });

  describe("frames", () => {
    const SOURCE = [
      "flowchart TD",
      "A --> B",
      'subgraph S ["Part"]',
      "  B --> C",
      "end",
      "C --> D",
      "A --> D",
    ].join("\n");

    it("hold their members and nothing else", async () => {
      const { laid } = await render(SOURCE);
      const frame = laid?.groups?.get("S");
      const inside = (id: string): boolean => {
        const rect = laid?.nodes.get(id);

        return (
          frame !== undefined && rect !== undefined && contains(frame, rect)
        );
      };

      expect(frame).toBeDefined();
      expect(inside("B")).toBe(true);
      expect(inside("C")).toBe(true);
      expect(inside("A")).toBe(false);
      expect(inside("D")).toBe(false);
    });

    it("keep lines that come from inside to outside connected to their blocks", async () => {
      const { nodes } = await render(SOURCE);
      const paths = nodes.filter(
        (node) => node.attrs["data-edge"] !== undefined,
      );

      expect(paths).toHaveLength(4);

      for (const path of paths) {
        const points = corners(path);

        expect(points.length).toBeGreaterThanOrEqual(2);
        expect(
          points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)),
        ).toBe(true);
      }
    });

    it("are drawn dashed, with their title", async () => {
      const { nodes } = await render(SOURCE);
      const frame = nodes.find((node) => node.attrs["data-frame"] === "S");

      expect(frame?.tag).toBe("rect");
      expect(
        nodes.some((node) => node.attrs["stroke-dasharray"] !== undefined),
      ).toBe(true);
      expect(nodes.flatMap(texts)).toContain("Part");
    });

    it("nest", async () => {
      const { laid } = await render(
        "flowchart TD\nsubgraph O\nsubgraph I\nA\nend\nB\nend\nA --> B",
      );
      const outer = laid?.groups?.get("O");
      const inner = laid?.groups?.get("I");

      expect(
        outer !== undefined && inner !== undefined && contains(outer, inner),
      ).toBe(true);
    });
  });

  describe("comments", () => {
    it("sit beside their block and join it with a horizontal dashed line", async () => {
      const { nodes, laid } = await render(
        "flowchart TD\nA --> B --> C\nN[*why*] -.- B",
      );
      const link = nodes.find((node) => node.attrs["data-edge"] === "e2");
      const points = link === undefined ? [] : corners(link);
      const target = laid?.nodes.get("B");

      expect(link).toBeDefined();
      expect(points).toHaveLength(2);
      expect(points[0]?.[1]).toBeCloseTo(points[1]?.[1] ?? NaN, 3);
      expect(target).toBeDefined();
      expect(
        Math.abs((points[0]?.[0] ?? 0) - (points[1]?.[0] ?? 0)),
      ).toBeGreaterThan(20);
      expect(nodes.flatMap(texts)).toContain("why");
    });

    it("move aside when the first spot is taken by a line", async () => {
      const { nodes } = await render(
        "flowchart TD\nA --> D{Q?}\nD -->|yes| B\nD -->|no| C\nN[*note*] -.- D",
      );
      const link = nodes.find((node) => node.attrs["data-edge"] === "e3");

      expect(link).toBeDefined();
      expect(nodes.flatMap(texts)).toContain("note");
    });

    it("can describe a frame", async () => {
      const { nodes } = await render(
        "flowchart TD\nsubgraph S\nA --> B\nend\nN[*about the frame*] -.- S",
      );

      expect(nodes.flatMap(texts)).toContain("about the frame");
    });

    it("stand above or below the block in a left-to-right diagram", async () => {
      const { nodes } = await render("flowchart LR\nA --> B\nN[*note*] -.- B");
      const link = nodes.find((node) => node.attrs["data-edge"] === "e1");
      const points = link === undefined ? [] : corners(link);

      expect(points).toHaveLength(2);
      expect(points[0]?.[0]).toBeCloseTo(points[1]?.[0] ?? NaN, 3);
    });
  });

  describe("decorations", () => {
    it("draws the stripe with its reference, clipped to the outline", async () => {
      const { nodes } = await render(
        'flowchart TD\nA@{ shape: doc, label: "Report", ref: "X84" }',
      );

      expect(nodes.flatMap(texts)).toEqual(
        expect.arrayContaining(["X84", "Report"]),
      );
      expect(nodes.some((node) => node.tag === "clipPath")).toBe(true);
    });

    it("draws a plain rectangle's stripe without clipping", async () => {
      const { nodes } = await render('flowchart TD\nA@{ ref: "X1" }');

      expect(nodes.some((node) => node.tag === "clipPath")).toBe(false);
      expect(nodes.flatMap(texts)).toContain("X1");
    });

    it("draws overlapping copies behind a stacked block", async () => {
      const plain = await render("flowchart TD\nA[Reports]");
      const stacked = await render(
        'flowchart TD\nA@{ shape: docs, label: "Reports" }',
      );
      const count = (nodes: readonly SvgNode[]): number =>
        nodes.filter((node) => node.tag === "path").length;

      expect(count(stacked.nodes) - count(plain.nodes)).toBe(3);
      expect(stacked.result.size.width).toBeGreaterThan(
        plain.result.size.width,
      );
    });

    it("writes the identifier and the descriptions around a block", async () => {
      const { nodes } = await render(
        'flowchart TD\nA@{ ident: "P1", desc: "out", input: "in" }',
      );

      expect(nodes.flatMap(texts)).toEqual(
        expect.arrayContaining(["P1", "out", "in"]),
      );
    });

    it("keeps captions inside the drawing", async () => {
      const { result, nodes } = await render(
        'flowchart TD\nA@{ ident: "A-very-long-identifier-on-the-left" }',
      );
      const text = nodes.find(
        (node) => node.tag === "text" && node.attrs["text-anchor"] === "start",
      );

      expect(text).toBeDefined();
      expect(result.size.width).toBeGreaterThan(100);
    });
  });

  describe("omission on a line", () => {
    it("is drawn as three dots instead of a label", async () => {
      const withSkip = await render("flowchart TD\nA -->|...| B");
      const without = await render("flowchart TD\nA --> B");
      const dots = (nodes: readonly SvgNode[]): number =>
        nodes.filter((node) => node.tag === "circle").length;

      expect(dots(withSkip.nodes)).toBe(3);
      expect(dots(without.nodes)).toBe(0);
      expect(withSkip.nodes.flatMap(texts)).not.toContain("...");
    });
  });

  describe("lines and bars", () => {
    it("draws a communication link as a zigzag that cuts the line", async () => {
      const { nodes } = await render("flowchart TD\nA -->|~| B");

      expect(nodes.filter((node) => node.tag === "polyline")).toHaveLength(1);
      expect(nodes.flatMap(texts)).not.toContain("~");
    });

    it("writes a legend under the diagram for each letter of a transfer", async () => {
      const { nodes } = await render(
        'flowchart TD\nA --> T(>P>) --> B\nT@{ legend: "permanent" }',
      );
      const words = nodes.flatMap(texts);

      expect(words).toEqual(expect.arrayContaining(["P", "- permanent"]));
      expect(nodes.filter((node) => node.tag === "polygon")).toHaveLength(2);
    });

    it("points a transfer along the flow and lets lines meet it at the middle of the flat side", async () => {
      const down = await render("flowchart TD\nA --> T(>P>) --> B");
      const across = await render("flowchart LR\nA --> T(>P>) --> B");
      const corners = (nodes: readonly SvgNode[]): string =>
        String(nodes.find((node) => node.tag === "polygon")?.attrs.points);
      const [a, b, c] = corners(down.nodes)
        .split(" ")
        .map((pair) => pair.split(",").map(Number));

      expect(a?.[1]).toBeCloseTo(b?.[1] ?? NaN, 3);
      expect((c?.[1] ?? 0) > (a?.[1] ?? 0)).toBe(true);
      expect(corners(across.nodes)).not.toBe(corners(down.nodes));
    });

    it("stretches the bar over the lines it receives and lets each end on its own point", async () => {
      const { nodes, laid } = await render(
        "flowchart TD\nA --> F[=]\nF --> B\nF --> C\nF --> D",
      );
      const bar = nodes.filter(
        (node) => node.tag === "line" && node.attrs.y1 === node.attrs.y2,
      );
      const length = Math.abs(
        Number(bar[0]?.attrs.x2) - Number(bar[0]?.attrs.x1),
      );
      const ends = ["e1", "e2", "e3"].map((id) => {
        const edge = nodes.find((node) => node.attrs["data-edge"] === id);

        return edge === undefined ? undefined : corners(edge)[0]?.[0];
      });

      expect(laid?.nodes.get("F")).toBeDefined();
      expect(length).toBeGreaterThan(160);
      expect(new Set(ends).size).toBe(ends.length);
    });

    it("stands a bar on its end in a left-to-right diagram", async () => {
      const { nodes } = await render(
        "flowchart LR\nA --> F[=]\nF --> B\nF --> C",
      );
      const bar = nodes.filter(
        (node) => node.tag === "line" && node.attrs.x1 === node.attrs.x2,
      );

      expect(bar.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("notes", () => {
    it("line up on one line when they stand on the same side", async () => {
      const { nodes } = await render(
        'flowchart TD\nA["a long label of a wide block"] --> B[x]\nn1[*one*] -.- A\nn2[*two*] -.- B',
      );
      const ends = ["e1", "e2"].map((id) => {
        const link = nodes.find((node) => node.attrs["data-edge"] === id);

        return link === undefined ? undefined : corners(link)[0]?.[0];
      });

      expect(ends[0]).toBeDefined();
      expect(ends[0]).toBeCloseTo(ends[1] ?? NaN, 3);
    });

    it("stand on the side that was asked for", async () => {
      const { nodes } = await render(
        "flowchart TD\nA --> B\nA -.- N[*note*] @{ side: left }",
      );
      const link = nodes.find((node) => node.attrs["data-edge"] === "e1");
      const [anchor, note] = link === undefined ? [] : corners(link);

      expect((note?.[0] ?? 0) < (anchor?.[0] ?? 0)).toBe(true);
    });

    it("set their text against the bracket", async () => {
      const { nodes } = await render("flowchart TD\nA\nN[*note*] -.- A");
      const text = nodes.find(
        (node) => node.tag === "text" && node.attrs["text-anchor"] === "start",
      );

      expect(text).toBeDefined();
    });
  });

  describe("frames in a left-to-right diagram", () => {
    it("keep the spacing the profile asks for between blocks inside them", async () => {
      const { laid } = await render("flowchart LR\nsubgraph S\nA --> B\nend");
      const a = laid?.nodes.get("A");
      const b = laid?.nodes.get("B");

      expect(a && b).toBeTruthy();
      expect(
        (b?.x ?? 0) - ((a?.x ?? 0) + (a?.width ?? 0)),
      ).toBeGreaterThanOrEqual(30);
    });
  });
});
