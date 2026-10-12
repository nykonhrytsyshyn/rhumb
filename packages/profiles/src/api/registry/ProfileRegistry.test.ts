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
