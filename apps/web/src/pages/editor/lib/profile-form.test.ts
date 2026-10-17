import { describe, expect, it } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";

import { parseForm, readField, toFormState, writeField } from "./profile-form";

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

describe("profile form", () => {
  it("turns every profile into text and back without loss", () => {
    for (const candidate of ProfileRegistry.withBuiltins().list()) {
      const parsed = parseForm(toFormState(candidate), candidate);

      expect(parsed.errors.size).toBe(0);
      expect(parsed.profile).toEqual(candidate);
    }
  });

  it("reads nested fields and returns an empty string for missing ones", () => {
    const state = toFormState(profile);

    expect(readField(state, "spacing.node")).toBe(String(profile.spacing.node));
    expect(readField(state, "spacing.missing")).toBe("");
    expect(readField(state, "grid.deeper")).toBe("");
  });

  it("writes a field without touching the original", () => {
    const state = toFormState(profile);
    const next = writeField(state, "shapes.process.minWidth", "42");

    expect(readField(next, "shapes.process.minWidth")).toBe("42");
    expect(readField(state, "shapes.process.minWidth")).not.toBe("42");
    expect(readField(next, "grid")).toBe(readField(state, "grid"));
  });

  it("creates missing branches when writing", () => {
    const next = writeField({}, "a.b.c", "x");

    expect(readField(next, "a.b.c")).toBe("x");
  });

  it("accepts a decimal comma", () => {
    const state = writeField(toFormState(profile), "padding", "1,5");

    expect(parseForm(state, profile).profile?.padding).toBe(1.5);
  });

  it("asks for a number where the text is not one", () => {
    const state = writeField(toFormState(profile), "grid", "abc");
    const parsed = parseForm(state, profile);

    expect(parsed.profile).toBeUndefined();
    expect(parsed.errors.get("grid")).toBe("editor.config.errors.number");
    expect(
      parseForm(
        writeField(toFormState(profile), "grid", "  "),
        profile,
      ).errors.get("grid"),
    ).toBe("editor.config.errors.number");
  });

  it("asks for positive values and allows a zero padding", () => {
    const state = writeField(
      writeField(toFormState(profile), "spacing.node", "0"),
      "padding",
      "-1",
    );
    const parsed = parseForm(state, profile);

    expect(parsed.errors.get("spacing.node")).toBe(
      "editor.config.errors.positive",
    );
    expect(parsed.errors.get("padding")).toBe(
      "editor.config.errors.notNegative",
    );
    expect(
      parseForm(writeField(toFormState(profile), "padding", "0"), profile)
        .profile?.padding,
    ).toBe(0);
  });

  it("requires a font family", () => {
    const parsed = parseForm(
      writeField(toFormState(profile), "font.family", ""),
      profile,
    );

    expect(parsed.errors.get("font.family")).toBe(
      "editor.config.errors.required",
    );
  });

  it("maps nested schema paths onto form fields", () => {
    const state = writeField(
      writeField(
        writeField(toFormState(profile), "line.dashGap", "x"),
        "line.arrowWidth",
        "-1",
      ),
      "shapes.decision.minHeight",
      "",
    );
    const { errors } = parseForm(state, profile);

    expect(errors.get("line.dashGap")).toBe("editor.config.errors.number");
    expect(errors.get("line.arrowWidth")).toBe(
      "editor.config.errors.notNegative",
    );
    expect(errors.get("shapes.decision.minHeight")).toBe(
      "editor.config.errors.number",
    );
  });

  it("splits branch labels on commas and ignores blanks", () => {
    const state = writeField(
      toFormState(profile),
      "decision.yesLabels",
      " yes , ok,, true ",
    );

    expect(parseForm(state, profile).profile?.decision.yes.labels).toEqual([
      "yes",
      "ok",
      "true",
    ]);
  });

  it("reports sides that clash as a problem of the whole group", () => {
    const decision = writeField(
      writeField(toFormState(profile), "decision.yes", "top"),
      "decision.entry",
      "top",
    );
    const preparation = writeField(
      toFormState(profile),
      "preparation.exit",
      "top",
    );

    expect(parseForm(decision, profile).general).toContain(
      "editor.config.errors.decisionSides",
    );
    expect(parseForm(preparation, profile).general).toContain(
      "editor.config.errors.preparationSides",
    );
  });

  it("reads the label style like any other setting of the profile", () => {
    const state = writeField(toFormState(profile), "line.labelStyle", "inline");

    expect(readField(state, "line.labelStyle")).toBe("inline");
    expect(parseForm(state, profile).profile?.line.labelStyle).toBe("inline");
  });

  it("rejects a label style that does not exist", () => {
    const parsed = parseForm(
      writeField(toFormState(profile), "line.labelStyle", "diagonal"),
      profile,
    );

    expect(parsed.profile).toBeUndefined();
    expect(parsed.errors.get("line.labelStyle")).toBe(
      "editor.config.errors.invalid",
    );
  });

  it("keeps the identity of the base profile", () => {
    const parsed = parseForm(toFormState(profile), {
      ...profile,
      id: "custom",
      title: "Mine",
    });

    expect(parsed.profile).toMatchObject({ id: "custom", title: "Mine" });
  });
});
