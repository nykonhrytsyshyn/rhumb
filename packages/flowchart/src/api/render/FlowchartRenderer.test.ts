import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import {
  ApproximateTextMeasurer,
  type LayoutEngine,
  type LayoutResult,
  type Point,
  type Rect,
  type SvgNode,
} from "@rhumb/kernel";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import { ProfileRegistry } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { FlowchartRenderer } from "./FlowchartRenderer";
import type { Appearance, RenderedDiagram } from "./types";

const SOURCE = [
  "flowchart TD",
  "start([Начало]) --> read[/Ввод n/]",
  "read --> check{n > 0?}",
  "check -->|Да| work[Обработка]",
  "check -->|Нет| stop([Конец])",
  "work -.-> stop",
].join("\n");

const STORE = [
  "flowchart TD",
  "Start([Visit online store]) --> Browse[Browse products]",
  "Browse --> Cart[Add items to cart]",
  "Cart --> Decide{Ready to check out?}",
  "Decide -->|Keep shopping| Browse",
  "Decide -->|Yes| Pay[Enter payment details]",
  "Pay --> Valid{Payment accepted?}",
  "Valid -->|No| Retry[Show error message]",
  "Retry --> Pay",
  "Valid -->|Yes| Confirm[Order confirmed]",
  "Confirm --> Done([Email receipt])",
].join("\n");

const RETURNS = [
  "flowchart TD",
  'A(["Start"]) --> B[/"Input<br/>N"/]',
  'B --> C{{"From i = 0 to N - 1"}}',
  'C --> D[/"Input<br/>a[i]"/]',
  "D --> C",
  'C --> E["sum = 0"]',
  'E --> F{{"From p = a to a + N - 1"}}',
  'F --> G{"(p - a) is even<br/>and *p is even"}',
  'G -->|Yes| H["sum = sum + *p"]',
  "G -->|No| F",
  "H --> F",
  'F --> I[/"Output<br/>sum"/]',
  'I --> J(["Stop"])',
].join("\n");

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

/** Lines of the drawing, one per diagram edge. */
function edgePaths(nodes: readonly SvgNode[]): readonly SvgNode[] {
  return nodes.filter((node) => node.attrs["data-edge"] !== undefined);
}

/** Corner points of a path; arch commands contribute their end point. */
function cornersOf(path: SvgNode): readonly (readonly [number, number])[] {
  return String(path.attrs.d)
    .split(/(?=[MLA])/)
    .map((command) => command.slice(1).trim().split(/[ ,]+/).map(Number))
    .map((numbers) => numbers.slice(-2))
    .map(([x, y]) => [x ?? 0, y ?? 0] as const);
}

function profileAt(index: number) {
  const profile = ProfileRegistry.withBuiltins().list()[index];

  if (profile === undefined) {
    throw new Error("Missing profile");
  }

  return profile;
}

function rendererFor(
  index: number,
  appearance?: Partial<Appearance>,
  layoutEngine: LayoutEngine = new ElkLayoutEngine(new ELK()),
) {
  return new FlowchartRenderer({
    profile: profileAt(index),
    layoutEngine,
    measurer: new ApproximateTextMeasurer(),
    ...(appearance === undefined ? {} : { appearance }),
  });
}

async function render(index: number, source = SOURCE) {
  const result = await rendererFor(index).render(
    new FlowchartParser().parse(source),
  );

  return { result, nodes: descendants(result.svg) };
}

async function renderInline(source: string, appearance?: Partial<Appearance>) {
  const result = await new FlowchartRenderer({
    profile: {
      ...profileAt(0),
      line: { ...profileAt(0).line, labelStyle: "inline" },
    },
    layoutEngine: new ElkLayoutEngine(new ELK()),
    measurer: new ApproximateTextMeasurer(),
    ...(appearance === undefined ? {} : { appearance }),
  }).render(new FlowchartParser().parse(source));

  return { result, nodes: descendants(result.svg) };
}

function backdrops(nodes: readonly SvgNode[]): readonly SvgNode[] {
  return nodes.filter((node) => node.attrs["data-label"] !== undefined);
}

/** Renders while keeping the layout the engine computed. */
async function renderWithLayout(source: string) {
  const elk = new ElkLayoutEngine(new ELK());
  let layout: LayoutResult | undefined;
  const engine: LayoutEngine = {
    layout: async (request) => {
      layout = await elk.layout(request);
      return layout;
    },
  };

  await rendererFor(0, undefined, engine).render(
    new FlowchartParser().parse(source),
  );

  if (layout === undefined) {
    throw new Error("No layout was computed");
  }

  return layout;
}

function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));

  return Math.hypot(dx, dy);
}

function expectTextInside(
  result: RenderedDiagram,
  nodes: readonly SvgNode[],
): void {
  const group = nodes.find(
    (node) => node.tag === "g" && node.attrs.transform !== undefined,
  );
  const shift = /translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(
    String(group?.attrs.transform),
  );
  const shiftX = Number(shift?.[1]);
  const shiftY = Number(shift?.[2]);
  const fontSize = profileAt(0).font.size * 4;
  const glyph = fontSize * 0.6;

  const spans = nodes.filter((node) => node.tag === "tspan");

  expect(spans.length).toBeGreaterThan(10);

  for (const span of spans) {
    const text = span.children
      .filter((child) => typeof child === "string")
      .join("");
    const x = Number(span.attrs.x) + shiftX;
    const y = Number(span.attrs.y) + shiftY;

    expect(x - (text.length * glyph) / 2).toBeGreaterThanOrEqual(0);
    expect(x + (text.length * glyph) / 2).toBeLessThanOrEqual(
      result.size.width,
    );
    expect(y - fontSize / 2).toBeGreaterThanOrEqual(0);
    expect(y + fontSize / 2).toBeLessThanOrEqual(result.size.height);
  }
}

describe("FlowchartRenderer", () => {
  it("renders every block, line and label", async () => {
    const { result, nodes } = await render(0);

    expect(result.size.width).toBeGreaterThan(0);
    expect(result.size.height).toBeGreaterThan(0);
    expect(result.svg.attrs.xmlns).toBe("http://www.w3.org/2000/svg");
    expect(edgePaths(nodes)).toHaveLength(5);
    expect(nodes.some((node) => node.tag === "polygon")).toBe(true);
    expect(texts(result.svg)).toEqual(
      expect.arrayContaining(["Начало", "Да", "Нет"]),
    );
  });

  it("draws arrows and dashed lines", async () => {
    const { nodes } = await render(0);
    const lines = edgePaths(nodes);

    expect(nodes.some((node) => node.tag === "marker")).toBe(true);
    expect(lines.some((line) => line.attrs["marker-end"] !== undefined)).toBe(
      true,
    );
    expect(lines.filter((line) => line.attrs["stroke-dasharray"])).toHaveLength(
      1,
    );
  });

  it("uses the arrow style of the profile", async () => {
    const arrowPath = async (index: number) => {
      const { nodes } = await render(index);

      return nodes.find(
        (node) =>
          node.tag === "path" &&
          node.attrs["data-edge"] === undefined &&
          node.attrs.stroke !== undefined,
      );
    };
    const shapes = await Promise.all([arrowPath(0), arrowPath(1)]);
    const styles = shapes.map((path) => String(path?.attrs.fill));

    expect(new Set(styles).size).toBe(2);
  });

  it("renders every supported flow direction", async () => {
    for (const direction of ["TD", "BT", "LR", "RL"]) {
      const { nodes } = await render(
        0,
        `flowchart ${direction}\nA{Q} -->|Да| B\nA -->|Нет| C`,
      );

      expect(edgePaths(nodes)).toHaveLength(2);
    }
  });

  it("renders an empty diagram as a blank page", async () => {
    const { result } = await render(0, "flowchart TD");
    expect(result.size.width).toBeGreaterThan(0);
  });

  it("lets the caller drop the page background", async () => {
    const parsed = new FlowchartParser().parse("flowchart TD\nA");
    const withPaper = await rendererFor(0).render(parsed);
    const transparent = await rendererFor(0, { background: null }).render(
      parsed,
    );
    const rects = (svg: SvgNode) =>
      svg.children.filter(
        (child) => typeof child !== "string" && child.tag === "rect",
      );

    expect(rects(withPaper.svg)).toHaveLength(1);
    expect(rects(transparent.svg)).toHaveLength(0);
  });

  it("draws a preparation block with the return on one corner and the exit on the other", async () => {
    const { nodes } = await render(
      0,
      [
        "flowchart TD",
        "start([Start]) --> head{{For i}}",
        "head --> body[Work]",
        "body --> head",
        "head --> done([End])",
      ].join("\n"),
    );
    const hexagon = nodes.find(
      (node) =>
        node.tag === "polygon" &&
        String(node.attrs.points).split(" ").length === 6,
    );

    expect(hexagon).toBeDefined();
    const vertices = String(hexagon?.attrs.points)
      .split(" ")
      .map((pair) => pair.split(",").map(Number) as [number, number]);
    const [topLeft, , rightVertex, bottomRight, , leftVertex] = vertices;

    if (!topLeft || !rightVertex || !bottomRight || !leftVertex) {
      throw new Error("Unexpected hexagon");
    }

    const centerX = (topLeft[0] + bottomRight[0]) / 2;
    const top = topLeft[1];
    const bottom = bottomRight[1];

    const lines = edgePaths(nodes).map(cornersOf);
    const starts = lines.map((points) => points[0]);
    const ends = lines.map((points) => points.at(-1));
    const near = (a: readonly number[] | undefined, b: readonly number[]) =>
      a !== undefined &&
      Math.abs((a[0] ?? 0) - (b[0] ?? 0)) < 0.1 &&
      Math.abs((a[1] ?? 0) - (b[1] ?? 0)) < 0.1;

    expect(ends.some((end) => near(end, [centerX, top]))).toBe(true);
    expect(starts.some((start) => near(start, [centerX, bottom]))).toBe(true);
    expect(ends.some((end) => near(end, leftVertex))).toBe(true);
    expect(starts.some((start) => near(start, rightVertex))).toBe(true);
  });

  it("keeps a straight run next to every arrowhead and block exit", async () => {
    const layout = await renderWithLayout(RETURNS);
    const stub = profileAt(0).line.stub * 4;

    for (const points of layout.edges.values()) {
      const length = (a: Point | undefined, b: Point | undefined) =>
        a === undefined || b === undefined
          ? 0
          : Math.hypot(b.x - a.x, b.y - a.y);

      expect(length(points[0], points[1])).toBeGreaterThanOrEqual(stub - 0.5);
      expect(length(points.at(-2), points.at(-1))).toBeGreaterThanOrEqual(
        stub - 0.5,
      );
    }
  });

  it("keeps lines clear of the blocks they pass", async () => {
    const layout = await renderWithLayout(RETURNS);
    const clearance = profileAt(0).spacing.clearance * 4;
    const diagram = new FlowchartParser().parse(RETURNS);
    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id) ?? [];

      for (const [id, rect] of layout.nodes) {
        if (id === edge.from || id === edge.to) {
          continue;
        }

        for (const [index, from] of points.slice(0, -1).entries()) {
          const to = points[index + 1];

          if (to === undefined) {
            continue;
          }

          const steps = 20;

          for (let step = 0; step <= steps; step += 1) {
            const t = step / steps;
            const sample = {
              x: from.x + (to.x - from.x) * t,
              y: from.y + (to.y - from.y) * t,
            };

            expect(distanceToRect(sample, rect)).toBeGreaterThanOrEqual(
              clearance - 0.5,
            );
          }
        }
      }
    }
  });

  it("arches lines that cross without belonging together", async () => {
    const box = { width: 20, height: 20 };
    const crossing: LayoutEngine = {
      layout: () =>
        Promise.resolve({
          nodes: new Map([
            ["A", { x: 0, y: 40, ...box }],
            ["B", { x: 200, y: 40, ...box }],
            ["C", { x: 90, y: 0, ...box }],
            ["D", { x: 90, y: 100, ...box }],
          ]),
          edges: new Map([
            [
              "e0",
              [
                { x: 20, y: 50 },
                { x: 200, y: 50 },
              ],
            ],
            [
              "e1",
              [
                { x: 100, y: 20 },
                { x: 100, y: 100 },
              ],
            ],
          ]),
          size: { width: 220, height: 120 },
        }),
    };
    const { svg } = await rendererFor(0, undefined, crossing).render(
      new FlowchartParser().parse("flowchart TD\nA --> B\nC --> D"),
    );
    const [horizontal, vertical] = edgePaths(descendants(svg));

    expect(String(horizontal?.attrs.d)).toContain(
      `A${String(profileAt(0).line.jump * 4)},${String(profileAt(0).line.jump * 4)} 0 0 1`,
    );
    expect(String(vertical?.attrs.d)).not.toContain("A");
  });

  it("brings every return to a preparation block in without crossing its repeated section", async () => {
    const { nodes } = await render(0, RETURNS);
    const arched = edgePaths(nodes).filter((path) =>
      String(path.attrs.d).includes("A"),
    );

    expect(arched).toHaveLength(0);
  });

  describe("lines that merge", () => {
    const MERGE = [
      "flowchart TD",
      "A{ok?} -->|Yes| B[work]",
      "A -->|No| C[skip]",
      "B --> D[end]",
      "C --> D",
    ].join("\n");

    async function endsOf(merge: boolean) {
      const profile = profileAt(0);
      const result = await new FlowchartRenderer({
        profile: {
          ...profile,
          line: { ...profile.line, arrow: { ...profile.line.arrow, merge } },
        },
        layoutEngine: new ElkLayoutEngine(new ELK()),
        measurer: new ApproximateTextMeasurer(),
      }).render(new FlowchartParser().parse(MERGE));
      const paths = edgePaths(descendants(result.svg));

      return paths
        .filter((path) =>
          ["e2", "e3"].includes(String(path.attrs["data-edge"])),
        )
        .map((path) => cornersOf(path).at(-1)?.join(","));
    }

    it("ends the shorter line on the one it joins, with its own arrowhead", async () => {
      const [first, second] = await endsOf(true);

      expect(first).not.toBe(second);
    });

    it("lets both lines run to the block when merge arrows are off", async () => {
      const [first, second] = await endsOf(false);

      expect(first).toBe(second);
    });
  });

  describe("labels that need room", () => {
    async function heightOf(source: string) {
      const profile = profileAt(0);
      const result = await new FlowchartRenderer({
        profile: {
          ...profile,
          line: { ...profile.line, labelStyle: "beside" },
          spacing: { ...profile.spacing, layer: 1, clearance: 1 },
        },
        layoutEngine: new ElkLayoutEngine(new ELK()),
        measurer: new ApproximateTextMeasurer(),
      }).render(new FlowchartParser().parse(source));

      return result.size.height;
    }

    it("lengthens a line that is too short for its label", async () => {
      const bare = await heightOf("flowchart TD\nA[a] --> B[b]");
      const labelled = await heightOf(
        'flowchart TD\nA[a] -->|"a rather long label"| B[b]',
      );

      expect(labelled).toBeGreaterThan(bare);
    });
  });

  it("draws no arches when nothing crosses", async () => {
    const { nodes } = await render(0, SOURCE);

    expect(
      edgePaths(nodes).some((path) => String(path.attrs.d).includes("A")),
    ).toBe(false);
  });

  it("keeps every piece of text inside the drawing", async () => {
    const { result, nodes } = await render(
      0,
      `${STORE}\nValid -->|An unusually long explanation of this branch| Done`,
    );

    expectTextInside(result, nodes);
  });

  describe("label styles", () => {
    it("keeps labels beside their lines, without backdrops, by default", async () => {
      const { nodes } = await render(0, STORE);

      expect(backdrops(nodes)).toHaveLength(0);
    });

    it("puts labels on their lines over a backdrop of their own size", async () => {
      const { nodes } = await renderInline(STORE);
      const patches = backdrops(nodes);

      expect(patches.map((patch) => patch.attrs["data-label"]).sort()).toEqual([
        "Keep shopping",
        "No",
        "Yes",
        "Yes",
      ]);

      const lines = edgePaths(nodes).map(cornersOf);
      const onSomeLine = (x: number, y: number) =>
        lines.some((corners) =>
          corners.slice(1).some(([x2, y2], index) => {
            const [x1, y1] = corners[index] ?? [0, 0];
            const length = Math.hypot(x2 - x1, y2 - y1) || 1;
            const cross = Math.abs((x2 - x1) * (y1 - y) - (x1 - x) * (y2 - y1));
            const within =
              (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1) >= 0 &&
              (x - x2) * (x1 - x2) + (y - y2) * (y1 - y2) >= 0;

            return cross / length < 0.5 && within;
          }),
        );

      for (const patch of patches) {
        const x = Number(patch.attrs.x) + Number(patch.attrs.width) / 2;
        const y = Number(patch.attrs.y) + Number(patch.attrs.height) / 2;

        expect(onSomeLine(x, y)).toBe(true);
      }
    });

    it("fills backdrops with the label background colour", async () => {
      const { nodes } = await renderInline(STORE, { labelBackground: "red" });
      const group = nodes.find(
        (node) =>
          node.tag === "g" &&
          node.children.some(
            (child) =>
              typeof child !== "string" &&
              child.attrs["data-label"] !== undefined,
          ),
      );

      expect(group?.attrs.fill).toBe("red");
    });

    it("keeps inline labels inside the drawing", async () => {
      const { result, nodes } = await renderInline(
        `${STORE}\nValid -->|An unusually long explanation of this branch| Done`,
      );

      expectTextInside(result, nodes);
    });
  });
});
