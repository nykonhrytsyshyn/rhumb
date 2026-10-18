import { describe, expect, it } from "vitest";

import { Side } from "@rhumb/kernel";
import {
  ProfileRegistry,
  type SideChoice,
  type StandardProfile,
} from "@rhumb/profiles";
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

/** The profile with the sides of its decision blocks replaced. */
function withDecision(sides: {
  readonly entry: SideChoice;
  readonly yes: SideChoice;
  readonly no: SideChoice;
}): StandardProfile {
  const { decision } = profile;

  return {
    ...profile,
    decision: {
      entry: sides.entry,
      yes: { ...decision.yes, side: sides.yes },
      no: { ...decision.no, side: sides.no },
    },
  };
}

/** Every side of a decision is named, so nothing is left to the planner. */
const FIXED = withDecision({ entry: "top", yes: "left", no: "right" });

/** Yes and no may each take the left or the right side. */
const OPEN = withDecision({ entry: "top", yes: "side", no: "side" });

/** Sides a fixed profile prescribes for a decision, in the flow direction. */
function decisionSides(direction: "TB" | "LR" = "TB") {
  const orientation = Orientation.of(direction);
  const entry = orientation.mapProfileSide("top");
  const yes = orientation.mapProfileSide("left");
  const no = orientation.mapProfileSide("right");
  const extra = SIDES.find((side) => ![entry, yes, no].includes(side));

  if (extra === undefined) {
    throw new Error("A decision always leaves one side free");
  }

  return { entry, yes, no, extra };
}

function plan(
  source: string,
  direction: "TB" | "LR" | "BT" = "TB",
  using: StandardProfile = FIXED,
) {
  const diagram = new FlowchartParser().parse(source);

  return new PortPlanner(using, Orientation.of(direction)).plan(diagram);
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

  describe("open side choices", () => {
    it("lets yes take the left and no the right when nothing says otherwise", () => {
      const sides = plan(
        "flowchart TD\nA{Q} -->|No| B\nA -->|Yes| C",
        "TB",
        OPEN,
      );

      expect(sides.get("e0")?.fromSide).toBe(Side.Right);
      expect(sides.get("e1")?.fromSide).toBe(Side.Left);
    });

    it("never gives two branches the same side", () => {
      const sides = plan(
        "flowchart TD\nA{Q} -->|Yes| B\nA -->|Yes| C",
        "TB",
        OPEN,
      );

      expect(sides.get("e0")?.fromSide).not.toBe(sides.get("e1")?.fromSide);
    });

    it("sends a branch that goes back to a preparation block to its return side", () => {
      const sides = plan(
        [
          "flowchart TD",
          "L{{for}} --> D{ok?}",
          "D -->|Yes| W[work]",
          "D -->|No| L",
          "W --> L",
          "L --> E[end]",
        ].join("\n"),
        "TB",
        OPEN,
      );

      expect(sides.get("e2")?.fromSide).toBe(Side.Left);
      expect(sides.get("e1")?.fromSide).toBe(Side.Right);
      expect(sides.get("e2")?.toSide).toBe(Side.Left);
    });

    it("gives the returning branch the return side even when it is labelled yes", () => {
      const sides = plan(
        [
          "flowchart TD",
          "L{{for}} --> D{ok?}",
          "D -->|Yes| L",
          "D -->|No| W[work]",
          "W --> L",
          "L --> E[end]",
        ].join("\n"),
        "TB",
        OPEN,
      );

      expect(sides.get("e1")?.fromSide).toBe(Side.Left);
      expect(sides.get("e2")?.fromSide).toBe(Side.Right);
    });

    it("follows the flow direction when it is rotated", () => {
      const sides = plan(
        "flowchart LR\nA{Q} -->|Yes| B\nA -->|No| C",
        "LR",
        OPEN,
      );

      expect(sides.get("e0")?.fromSide).toBe(Side.Top);
      expect(sides.get("e1")?.fromSide).toBe(Side.Bottom);
      expect(sides.get("e0")?.fromSide).not.toBe(sides.get("e0")?.toSide);
    });

    it("settles an open vertical choice on the side that follows the flow", () => {
      const vertical = withDecision({
        entry: "left",
        yes: "vertical",
        no: "right",
      });
      const sides = plan(
        "flowchart TD\nA{Q} -->|Yes| B\nA -->|No| C",
        "TB",
        vertical,
      );

      expect(sides.get("e0")?.fromSide).toBe(Side.Bottom);
      expect(sides.get("e1")?.fromSide).toBe(Side.Right);
    });

    it("turns the entry around when the flow runs bottom-up", () => {
      const entry = withDecision({
        entry: "vertical",
        yes: "left",
        no: "right",
      });
      const sides = plan("flowchart BT\nA --> B{Q}", "BT", entry);

      expect(sides.get("e0")?.toSide).toBe(Side.Bottom);
    });
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

describe("PortPlanner with a loop inside a loop", () => {
  const source = [
    "flowchart TD",
    "A --> B{{outer}}",
    "B --> E[work]",
    "E --> F{{inner}}",
    "F --> G[step]",
    "G --> F",
    "F --> H[after]",
    "H --> B",
    "B --> Z[end]",
  ].join("\n");
  const sides = plan(source);

  it("enters the inner block from the flow side and not from the return side", () => {
    // E -> F is the third edge.
    expect(sides.get("e2")?.toSide).toBe(Side.Top);
    expect(sides.get("e4")?.toSide).toBe(Side.Left);
  });

  it("leaves the inner block for its own loop from the bottom and for the rest from the side", () => {
    expect(sides.get("e3")?.fromSide).toBe(Side.Bottom);
    expect(sides.get("e5")?.fromSide).toBe(Side.Right);
  });
});
