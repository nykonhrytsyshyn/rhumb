import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import { ApproximateTextMeasurer, type SvgNode } from "@rhumb/kernel";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import { ProfileRegistry } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { FlowchartRenderer } from "./FlowchartRenderer";
import type { Appearance } from "./types";

const SOURCE = [
  "flowchart TD",
  "start([Start]) --> read[/Input n/]",
  "read --> check{n > 0?}",
  "check -->|Yes| work[Processing]",
  "check -->|No| stop([End])",
  "work -.-> stop",
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

function profileAt(index: number) {
  const profile = ProfileRegistry.withBuiltins().list()[index];

  if (profile === undefined) {
    throw new Error("Missing profile");
  }

  return profile;
}

function rendererFor(index: number, appearance?: Partial<Appearance>) {
  return new FlowchartRenderer({
    profile: profileAt(index),
    layoutEngine: new ElkLayoutEngine(new ELK()),
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

describe("FlowchartRenderer", () => {
  it("renders every block, line and label", async () => {
    const { result, nodes } = await render(0);

    expect(result.size.width).toBeGreaterThan(0);
    expect(result.size.height).toBeGreaterThan(0);
    expect(result.svg.attrs.xmlns).toBe("http://www.w3.org/2000/svg");
    expect(nodes.filter((node) => node.tag === "polyline")).toHaveLength(5);
    expect(nodes.some((node) => node.tag === "polygon")).toBe(true);
    expect(texts(result.svg)).toEqual(
      expect.arrayContaining(["Start", "Yes", "No"]),
    );
  });

  it("draws arrows and dashed lines", async () => {
    const { nodes } = await render(0);
    const lines = nodes.filter((node) => node.tag === "polyline");

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
        (node) => node.tag === "path" && node.attrs.stroke !== undefined,
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
        `flowchart ${direction}\nA{Q} -->|Yes| B\nA -->|No| C`,
      );

      expect(nodes.filter((node) => node.tag === "polyline")).toHaveLength(2);
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

  it("draws loop headers with the return on one corner and the exit on the other", async () => {
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

    const lines = nodes
      .filter((node) => node.tag === "polyline")
      .map((node) =>
        String(node.attrs.points)
          .split(" ")
          .map((pair) => pair.split(",").map(Number) as [number, number]),
      );
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
});
