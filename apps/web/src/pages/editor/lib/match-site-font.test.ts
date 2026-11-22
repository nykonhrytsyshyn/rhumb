import { describe, expect, it } from "vitest";

import { firstFontFamily } from "./first-font-family";
import { matchSiteFont } from "./match-site-font";

describe("firstFontFamily", () => {
  it("takes the first font and drops its quotes", () => {
    expect(firstFontFamily("'OpenGost Type A', Arial, sans-serif")).toBe(
      "OpenGost Type A",
    );
    expect(firstFontFamily('"Inter Variable", sans-serif')).toBe(
      "Inter Variable",
    );
    expect(firstFontFamily("  Arial , serif")).toBe("Arial");
    expect(firstFontFamily("")).toBe("");
  });
});

describe("matchSiteFont", () => {
  it("finds the site font that a stack starts with", () => {
    expect(matchSiteFont("'OpenGost Type B', Arial")?.id).toBe("opengost-b");
    expect(matchSiteFont("opengost type a")?.id).toBe("opengost-a");
    expect(matchSiteFont('"JetBrains Mono Variable", monospace')?.id).toBe(
      "jetbrains-mono",
    );
  });

  it("does not match a site font that is only a fallback", () => {
    expect(matchSiteFont("Arial, 'OpenGost Type A'")).toBeUndefined();
    expect(matchSiteFont("'GOST type A', Arial")).toBeUndefined();
    expect(matchSiteFont("")).toBeUndefined();
  });
});
