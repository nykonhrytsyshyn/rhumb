import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@features/theme";

import { renderDiagram } from "../api/render-diagram";
import { EditorPage } from "./editor-page";

vi.mock("../api/render-diagram", () => ({ renderDiagram: vi.fn() }));
vi.mock("./panel/source-editor", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="source"
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  ),
}));

const mocked = vi.mocked(renderDiagram);

function stubBrowser(wide: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: wide,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function renderPage() {
  return render(
    <ThemeProvider>
      <EditorPage />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  stubBrowser(true);
  mocked.mockResolvedValue({
    svg: "<svg data-test='drawing'></svg>",
    size: { width: 10, height: 5 },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("EditorPage", () => {
  it("draws the saved sample with the first profile", async () => {
    const { container } = renderPage();

    await waitFor(() => {
      expect(
        container.querySelector("svg[data-test='drawing']"),
      ).not.toBeNull();
    });
    expect(mocked.mock.calls[0]?.[0]).toContain("flowchart TD");
  });

  it("re-renders and remembers an edited source", async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText("source"), {
      target: { value: "flowchart LR\nA --> B" },
    });
    await waitFor(() => {
      expect(mocked).toHaveBeenLastCalledWith(
        "flowchart LR\nA --> B",
        expect.anything(),
        expect.anything(),
      );
    });
    expect(window.localStorage.getItem("rhumb:source")).toBe(
      "flowchart LR\nA --> B",
    );
  });

  it("restores the source from the previous visit", async () => {
    window.localStorage.setItem("rhumb:source", "flowchart BT\nX --> Y");
    renderPage();
    await waitFor(() => {
      expect(mocked).toHaveBeenCalledWith(
        "flowchart BT\nX --> Y",
        expect.anything(),
        expect.anything(),
      );
    });
  });

  it("closes and reopens the panel from the canvas", () => {
    const { container } = renderPage();
    const panel = container.querySelector("aside");

    expect(panel?.getAttribute("data-open")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(panel?.getAttribute("data-open")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Open panel" }));
    expect(panel?.getAttribute("data-open")).toBe("true");
  });

  it("starts with a collapsed panel on a phone", () => {
    stubBrowser(false);

    const { container } = renderPage();

    expect(container.querySelector("aside")?.getAttribute("data-open")).toBe(
      "false",
    );
  });

  it("shows a version label and a heading for assistive tech", () => {
    renderPage();
    expect(screen.getByText(/^v\d/)).toBeDefined();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Rhumb",
    );
  });

  it("draws with the label style saved on the previous visit", async () => {
    window.localStorage.setItem("rhumb:label-style", "inline");
    renderPage();

    await waitFor(() => {
      expect(mocked).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        { labelStyle: "inline" },
      );
    });
  });

  it("falls back to labels beside lines for an unknown saved style", async () => {
    window.localStorage.setItem("rhumb:label-style", "diagonal");
    renderPage();

    await waitFor(() => {
      expect(mocked).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        { labelStyle: "beside" },
      );
    });
  });
});
