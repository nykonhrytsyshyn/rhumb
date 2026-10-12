import { describe, expect, it } from "vitest";

import { translate } from "./translate";

describe("translate", () => {
  it("returns the text in the requested language", () => {
    expect(translate("common.tabs.code", "en")).toBe("Code");
    expect(translate("common.tabs.code", "uk")).toBe("Код");
  });

  it("walks nested keys", () => {
    expect(translate("common.theme.mode.dark", "uk")).toBe("Темна");
  });

  it("falls back to the key for unknown paths", () => {
    expect(translate("common.nope" as never, "en")).toBe("common.nope");
    expect(translate("common.tabs" as never, "en")).toBe("common.tabs");
  });

  it("fills in placeholders and keeps unknown ones", () => {
    expect(translate("editor.config.loaded", "en", { title: "ISO" })).toBe(
      "Profile loaded: ISO",
    );
    expect(translate("editor.config.loaded", "uk", { title: "ISO" })).toBe(
      "Профіль завантажено: ISO",
    );
    expect(translate("editor.config.loaded", "en")).toBe(
      "Profile loaded: {title}",
    );
    expect(translate("editor.config.loaded", "en", { other: 1 })).toBe(
      "Profile loaded: {title}",
    );
  });
});
