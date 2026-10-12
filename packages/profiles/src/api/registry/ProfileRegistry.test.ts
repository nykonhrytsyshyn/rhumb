import { describe, expect, it } from "vitest";

import { InvalidProfileError, ProfileRegistry } from "./ProfileRegistry";

describe("ProfileRegistry", () => {
  it("loads and validates every built-in preset", () => {
    const registry = ProfileRegistry.withBuiltins();

    expect(registry.list().length).toBeGreaterThanOrEqual(2);
  });

  it("returns a registered profile by id", () => {
    const registry = ProfileRegistry.withBuiltins();
    const [first] = registry.list();

    expect(first).toBeDefined();

    if (first === undefined) {
      return;
    }

    expect(registry.has(first.id)).toBe(true);
    expect(registry.get(first.id)).toEqual(first);
  });

  it("throws for an unknown id", () => {
    expect(() => new ProfileRegistry().get("missing")).toThrow(
      'Unknown profile "missing"',
    );
  });

  it("rejects a profile that fails validation", () => {
    expect(() => new ProfileRegistry().register({ id: "broken" })).toThrow();
  });

  it("fills in line spacing settings that older profiles lack", () => {
    const [first] = ProfileRegistry.withBuiltins().list();

    if (first === undefined) {
      return;
    }

    const without = (value: object, ...keys: string[]) =>
      Object.fromEntries(
        Object.entries(value).filter(([key]) => !keys.includes(key)),
      );
    const spacing = without(first.spacing, "clearance", "line");
    const line = without(first.line, "jump", "stub");
    const registered = new ProfileRegistry().register({
      ...first,
      id: "legacy",
      spacing,
      line,
    });
    expect(registered.spacing.clearance).toBe(5);
    expect(registered.spacing.line).toBe(3);
    expect(registered.line.jump).toBe(2);
    expect(registered.line.stub).toBe(6);
  });

  it("lists readable issues with their paths", () => {
    try {
      new ProfileRegistry().register({ id: "broken", grid: -1 });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidProfileError);

      const issues = (error as InvalidProfileError).issues;

      expect(issues).toContain(
        "title: Invalid input: expected string, received undefined",
      );
      expect(issues.some((issue) => issue.startsWith("grid: "))).toBe(true);
    }
  });

  it("rejects a decision with clashing sides", () => {
    const registry = ProfileRegistry.withBuiltins();
    const [first] = registry.list();

    expect(first).toBeDefined();

    if (first === undefined) {
      return;
    }

    const clashing = {
      ...first,
      id: "clashing",
      decision: {
        ...first.decision,
        no: { ...first.decision.no, side: "top" },
      },
    };

    expect(() => new ProfileRegistry().register(clashing)).toThrow(
      /must all differ/,
    );
  });
});
