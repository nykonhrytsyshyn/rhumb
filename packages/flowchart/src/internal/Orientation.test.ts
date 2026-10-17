import { describe, expect, it } from "vitest";

import { Side } from "@rhumb/kernel";

import { Orientation } from "./Orientation";

describe("Orientation", () => {
  it("keeps sides for a top-down flow", () => {
    const orientation = Orientation.of("TB");

    expect(orientation.map(Side.Top)).toBe(Side.Top);
    expect(orientation.map(Side.Right)).toBe(Side.Right);
  });

  it("flips sides vertically for a bottom-up flow", () => {
    const orientation = Orientation.of("BT");

    expect(orientation.map(Side.Top)).toBe(Side.Bottom);
    expect(orientation.map(Side.Bottom)).toBe(Side.Top);
    expect(orientation.map(Side.Right)).toBe(Side.Right);
  });

  it("transposes sides for a left-to-right flow", () => {
    const orientation = Orientation.of("LR");

    expect(orientation.map(Side.Top)).toBe(Side.Left);
    expect(orientation.map(Side.Bottom)).toBe(Side.Right);
    expect(orientation.map(Side.Right)).toBe(Side.Bottom);
  });

  it("enters from the right for a right-to-left flow", () => {
    const orientation = Orientation.of("RL");

    expect(orientation.map(Side.Top)).toBe(Side.Right);
    expect(orientation.map(Side.Bottom)).toBe(Side.Left);
  });

  it("translates profile side names", () => {
    expect(Orientation.of("TB").mapProfileSide("bottom")).toBe(Side.Bottom);
    expect(Orientation.of("LR").mapProfileSide("bottom")).toBe(Side.Right);
  });
});

describe("Orientation.options", () => {
  const lean = { side: "left", vertical: "bottom" } as const;

  it("yields a particular side alone", () => {
    expect(Orientation.of("TB").options("top", lean)).toEqual([Side.Top]);
  });

  it("puts the leaned side of an open choice first", () => {
    expect(Orientation.of("TB").options("side", lean)).toEqual([
      Side.Left,
      Side.Right,
    ]);
    expect(
      Orientation.of("TB").options("side", { ...lean, side: "right" }),
    ).toEqual([Side.Right, Side.Left]);
    expect(Orientation.of("TB").options("vertical", lean)).toEqual([
      Side.Bottom,
      Side.Top,
    ]);
  });

  it("turns an open choice with the flow direction", () => {
    expect(Orientation.of("LR").options("side", lean)).toEqual([
      Side.Top,
      Side.Bottom,
    ]);
    expect(Orientation.of("BT").options("vertical", lean)).toEqual([
      Side.Top,
      Side.Bottom,
    ]);
  });
});
