import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggler } from "./theme-toggler";

const labels = { light: "Light", dark: "Dark", system: "System" };

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("ThemeProvider", () => {
  it("applies the stored theme and cycles through the modes", () => {
    window.localStorage.setItem("theme", "light");
    render(
      <ThemeProvider>
        <ThemeToggler label="Theme" modeLabels={labels} />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "Theme: Light" });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeDefined();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Theme: Dark" }));
    expect(screen.getByRole("button", { name: "Theme: System" })).toBeDefined();
  });

  it("falls back to the default when the stored value is invalid", () => {
    window.localStorage.setItem("theme", "purple");
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggler label="Theme" modeLabels={labels} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("button", { name: "Theme: Dark" })).toBeDefined();
  });

  it("refuses to be used without a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<ThemeToggler label="Theme" modeLabels={labels} />),
    ).toThrow(/ThemeProvider/);
  });
});
