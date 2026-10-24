import { describe, expect, it } from "vitest";

import { InvalidProfileError, ProfileRegistry } from "./ProfileRegistry";

describe("ProfileRegistry", () => {
  it("loads and validates every built-in preset", () => {
    const registry = ProfileRegistry.withBuiltins();

    expect(registry.list().length).toBeGreaterThanOrEqual(2);
  });

  it("marks exactly one built-in profile as the default", () => {
    const defaults = ProfileRegistry.withBuiltins()
      .list()
      .filter((profile) => profile.default);

    expect(defaults).toHaveLength(1);
  });

  it("treats a profile without the default flag as not default", () => {
    const [first] = ProfileRegistry.withBuiltins().list();

    if (first === undefined) {
      return;
    }

    const rest = Object.fromEntries(
      Object.entries(first).filter(([key]) => key !== "default"),
    );

    expect(new ProfileRegistry().register(rest).default).toBe(false);
  });

  it("accepts open side choices that can share the left and the right", () => {
    const [first] = ProfileRegistry.withBuiltins().list();

    if (first === undefined) {
      return;
    }

    const open = {
      ...first,
      id: "open",
      decision: {
        entry: "top",
        yes: { ...first.decision.yes, side: "side" },
        no: { ...first.decision.no, side: "side" },
      },
    };

    expect(new ProfileRegistry().register(open).decision.yes.side).toBe("side");
  });

  it("rejects open choices that need more sides than there are", () => {
    const [first] = ProfileRegistry.withBuiltins().list();

    if (first === undefined) {
      return;
    }

    const crowded = {
      ...first,
      id: "crowded",
      decision: {
        entry: "side",
        yes: { ...first.decision.yes, side: "side" },
        no: { ...first.decision.no, side: "side" },
      },
    };

    expect(() => new ProfileRegistry().register(crowded)).toThrow(
      /fit on different sides/,
    );
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

  it("defaults the label style and rejects an unknown one", () => {
    const [first] = ProfileRegistry.withBuiltins().list();

    if (first === undefined) {
      return;
    }

    const without = (value: object, ...keys: string[]) =>
      Object.fromEntries(
        Object.entries(value).filter(([key]) => !keys.includes(key)),
      );

    const legacy = new ProfileRegistry().register({
      ...first,
      id: "legacy",
      line: without(first.line, "labelStyle"),
    });

    expect(legacy.line.labelStyle).toBe("beside");
    expect(() =>
      new ProfileRegistry().register({
        ...first,
        id: "odd",
        line: { ...first.line, labelStyle: "diagonal" },
      }),
    ).toThrow(/labelStyle/);
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
      /fit on different sides/,
    );
  });
});
