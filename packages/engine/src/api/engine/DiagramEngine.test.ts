import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import { DiagramSyntaxError } from "@rhumb/kernel";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import { ProfileRegistry } from "@rhumb/profiles";

import { DiagramEngine } from "./DiagramEngine";

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

function newEngine(): DiagramEngine {
  return new DiagramEngine({ layoutEngine: new ElkLayoutEngine(new ELK()) });
}

const SOURCE = [
  "flowchart TD",
  "start([Start]) --> check{Ok?}",
  "check -->|Yes| done([End])",
  "check -->|No| start",
].join("\n");

describe("DiagramEngine", () => {
  it("turns source text into SVG markup", async () => {
    const result = await newEngine().render(SOURCE, { profile });

    expect(result.svg.startsWith("<svg ")).toBe(true);
    expect(result.svg).toContain("Start");
    expect(result.size.width).toBeGreaterThan(0);
  });

  it("honours scale and transparent background", async () => {
    const engine = newEngine();
    const small = await engine.render(SOURCE, { profile, scale: 2 });
    const large = await engine.render(SOURCE, {
      profile,
      scale: 4,
      appearance: { background: null, ink: "currentColor", fill: "none" },
    });

    expect(large.size.width).toBeGreaterThan(small.size.width);
    expect(large.svg).not.toContain("#ffffff");
    expect(large.svg).toContain('stroke="currentColor"');
  });

  it("rejects unsupported diagram types with a line number", async () => {
    await expect(
      newEngine().render("%% note\n\nsequenceDiagram\nA->>B: hi", {
        profile,
      }),
    ).rejects.toThrow(/Line 3: Diagram type "sequenceDiagram"/);
  });

  it("propagates syntax errors", async () => {
    await expect(
      newEngine().render("flowchart TD\nA -->", { profile }),
    ).rejects.toBeInstanceOf(DiagramSyntaxError);
  });
});
