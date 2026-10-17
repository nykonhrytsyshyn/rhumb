import { describe, expect, it } from "vitest";

import { Side } from "@rhumb/kernel";
import { ProfileRegistry } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { Orientation } from "./Orientation";
import { PortPlanner } from "./PortPlanner";

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("No built-in profile available");
  }

  return first;
})();

const SIDES = [Side.Top, Side.Right, Side.Bottom, Side.Left];

/** Sides the profile prescribes for a decision, in the given flow direction. */
function decisionSides(direction: "TB" | "LR" = "TB") {
  const orientation = Orientation.of(direction);
  const entry = orientation.mapProfileSide(profile.decision.entry);
  const yes = orientation.mapProfileSide(profile.decision.yes.side);
  const no = orientation.mapProfileSide(profile.decision.no.side);
  const extra = SIDES.find((side) => ![entry, yes, no].includes(side));

  if (extra === undefined) {
    throw new Error("A decision always leaves one side free");
  }

  return { entry, yes, no, extra };
}

function plan(source: string, direction: "TB" | "LR" = "TB") {
  const diagram = new FlowchartParser().parse(source);

  return new PortPlanner(profile, Orientation.of(direction)).plan(diagram);
}

describe("PortPlanner", () => {
  it("connects plain blocks from bottom to top", () => {
    const sides = plan("flowchart TD\nA --> B");

    expect(sides.get("e0")).toEqual({
      fromSide: Side.Bottom,
      toSide: Side.Top,
    });
  });

  it("sends yes and no branches to the profile sides", () => {
    const sides = plan("flowchart TD\nA{Q} -->|No| B\nA -->|Yes| C");

    expect(sides.get("e0")?.fromSide).toBe(decisionSides().no);
    expect(sides.get("e1")?.fromSide).toBe(decisionSides().yes);
  });

  it("matches labels case-insensitively and in other languages", () => {
    const sides = plan("flowchart TD\nA{Q} -->|YES| B\nA -->|no| C");

    expect(sides.get("e0")?.fromSide).toBe(decisionSides().yes);
    expect(sides.get("e1")?.fromSide).toBe(decisionSides().no);
  });

  it("fills unlabeled branches in yes, no, extra order", () => {
    const sides = plan("flowchart TD\nA{Q} --> B\nA --> C\nA --> D\nA --> E");
    const exits = ["e0", "e1", "e2", "e3"].map((id) => sides.get(id)?.fromSide);

    const { yes, no, extra } = decisionSides();

    expect(exits).toEqual([yes, no, extra, extra]);
  });

  it("does not give two branches to the same labelled side", () => {
    const sides = plan("flowchart TD\nA{Q} -->|Yes| B\nA -->|Yes| C");

    expect(sides.get("e0")?.fromSide).toBe(decisionSides().yes);
    expect(sides.get("e1")?.fromSide).toBe(decisionSides().no);
  });

  it("enters a decision through its entry side", () => {
    const sides = plan("flowchart TD\nA --> B{Q}");

    expect(sides.get("e0")?.toSide).toBe(decisionSides().entry);
  });

  it("rotates sides for a left-to-right flow", () => {
    const sides = plan("flowchart LR\nA{Q} -->|Yes| B\nA -->|No| C", "LR");

    expect(sides.get("e0")).toEqual({
      fromSide: decisionSides("LR").yes,
      toSide: Side.Left,
    });
    expect(sides.get("e1")?.fromSide).toBe(decisionSides("LR").no);
  });

  describe("returns to a preparation block", () => {
    const cycle = [
      "flowchart TD",
      "A --> L{{for i}}",
      "L --> B[body]",
      "B --> L",
      "L --> C[after]",
    ].join("\n");

    it("sends the repeated section from the bottom and the exit from the side", () => {
      const sides = plan(cycle);

      expect(sides.get("e1")?.fromSide).toBe(Side.Bottom);
      expect(sides.get("e3")?.fromSide).toBe(Side.Right);
    });

    it("enters from the top and returns into the opposite side corner", () => {
      const sides = plan(cycle);

      expect(sides.get("e0")?.toSide).toBe(Side.Top);
      expect(sides.get("e2")?.toSide).toBe(Side.Left);
    });

    it("handles a repeated section that branches and returns from several blocks", () => {
      const sides = plan(
        [
          "flowchart TD",
          "L{{for}} --> D{ok?}",
          "D -->|Yes| W[work]",
          "D -->|No| L",
          "W --> L",
          "L --> E[end]",
        ].join("\n"),
      );
      expect(sides.get("e0")?.fromSide).toBe(Side.Bottom);
      expect(sides.get("e2")?.toSide).toBe(Side.Left);
      expect(sides.get("e3")?.toSide).toBe(Side.Left);
      expect(sides.get("e4")?.fromSide).toBe(Side.Right);
    });

    it("treats a preparation block outside any cycle as plain flow", () => {
      const sides = plan("flowchart TD\nA --> P{{init}} --> B");

      expect(sides.get("e1")?.fromSide).toBe(Side.Bottom);
      expect(sides.get("e0")?.toSide).toBe(Side.Top);
    });

    it("rotates preparation sides for a left-to-right flow", () => {
      const sides = plan(cycle.replace("TD", "LR"), "LR");

      expect(sides.get("e0")?.toSide).toBe(Side.Left);
      expect(sides.get("e1")?.fromSide).toBe(Side.Right);
      expect(sides.get("e2")?.toSide).toBe(Side.Top);
      expect(sides.get("e3")?.fromSide).toBe(Side.Bottom);
    });
  });
});
