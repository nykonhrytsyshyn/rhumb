import { describe, expect, it } from "vitest";

import { svgNode } from "@rhumb/kernel";

import { SvgSerializer } from "./SvgSerializer";

describe("SvgSerializer", () => {
  const serializer = new SvgSerializer();

  it("self-closes nodes without children", () => {
    expect(serializer.serialize(svgNode("rect", { x: 1, y: "2" }))).toBe(
      '<rect x="1" y="2"/>',
    );
  });

  it("serializes nested nodes and text", () => {
    const tree = svgNode("g", {}, [svgNode("text", {}, ["A"])]);
    expect(serializer.serialize(tree)).toBe("<g><text>A</text></g>");
  });

  it("escapes special characters in text and attributes", () => {
    const tree = svgNode("text", { title: 'a"b' }, ["x < y & z"]);

    expect(serializer.serialize(tree)).toBe(
      '<text title="a&quot;b">x &lt; y &amp; z</text>',
    );
  });
});
