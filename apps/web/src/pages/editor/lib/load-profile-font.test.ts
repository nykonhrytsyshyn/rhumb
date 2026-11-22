// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import type { StandardProfile } from "@rhumb/profiles";

import { loadProfileFont } from "./load-profile-font";

const profile = {
  font: { family: "'OpenGost Type A', Arial, sans-serif" },
} as StandardProfile;

function stubFonts(load: (font: string) => Promise<unknown>): void {
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { load },
  });
}

afterEach(() => {
  Reflect.deleteProperty(document, "fonts");
});

describe("loadProfileFont", () => {
  it("waits for the font stack of the profile", async () => {
    const load = vi.fn(() => Promise.resolve([]));

    stubFonts(load);
    await loadProfileFont(profile);

    expect(load).toHaveBeenCalledWith(
      "16px 'OpenGost Type A', Arial, sans-serif",
    );
  });

  it("does nothing where the font loading API is missing", async () => {
    await expect(loadProfileFont(profile)).resolves.toBeUndefined();
  });

  it("carries on when the font cannot be loaded", async () => {
    stubFonts(() => Promise.reject(new Error("network")));

    await expect(loadProfileFont(profile)).resolves.toBeUndefined();
  });
});
