// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTheme } from "./apply-theme";
import { getSystemTheme } from "./get-system-theme";
import { isTheme } from "./is-theme";
import { nextTheme } from "./next-theme";
import { resolveTheme } from "./resolve-theme";

function mockSystem(dark: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: dark })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove("dark");
});

describe("theme utils", () => {
  it("recognises valid theme names only", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("cycles light, dark, system", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
    expect(nextTheme("system")).toBe("light");
  });

  it("follows the operating system for the system theme", () => {
    mockSystem(true);
    expect(getSystemTheme()).toBe("dark");
    expect(resolveTheme("system")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
    mockSystem(false);
    expect(getSystemTheme()).toBe("light");
  });

  it("toggles the dark class on the document", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
