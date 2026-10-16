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
import type { DiagramStore } from "../model/diagram-store";
import { MemoryDiagramStore } from "../model/memory-diagram-store";
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

function renderPage(libraryStore?: DiagramStore) {
  return render(
    <ThemeProvider>
      <EditorPage {...(libraryStore === undefined ? {} : { libraryStore })} />
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

  describe("saved diagrams", () => {
    const keep = {
      id: "keep",
      name: "Kept scheme",
      source: "flowchart LR\nK --> L",
      profileId: "gost-19.701-90",
      createdAt: 1,
      updatedAt: 1,
    };

    function openSavedTab(): void {
      fireEvent.click(screen.getByRole("tab", { name: /Saved/ }));
    }

    it("opens a saved diagram with its standard", async () => {
      renderPage(new MemoryDiagramStore([keep]));

      openSavedTab();
      fireEvent.click(
        await screen.findByRole("button", { name: "Open Kept scheme" }),
      );

      await waitFor(() => {
        expect(mocked).toHaveBeenLastCalledWith(
          "flowchart LR\nK --> L",
          expect.objectContaining({ id: "gost-19.701-90" }),
        );
      });
      expect(window.localStorage.getItem("rhumb:current-diagram")).toBe("keep");
      expect(window.localStorage.getItem("rhumb:source")).toBe(
        "flowchart LR\nK --> L",
      );
    });

    it("keeps the current standard when the saved one is gone", async () => {
      renderPage(new MemoryDiagramStore([{ ...keep, profileId: "retired" }]));

      openSavedTab();
      fireEvent.click(
        await screen.findByRole("button", { name: "Open Kept scheme" }),
      );

      await waitFor(() => {
        expect(mocked).toHaveBeenLastCalledWith(
          "flowchart LR\nK --> L",
          expect.objectContaining({ default: true }),
        );
      });
    });

    it("remembers which saved diagram was open", async () => {
      window.localStorage.setItem("rhumb:current-diagram", "keep");
      renderPage(new MemoryDiagramStore([keep]));

      openSavedTab();

      expect(await screen.findByText("Open now")).toBeDefined();
    });

    it("saves what is in the editor as a new diagram", async () => {
      const store = new MemoryDiagramStore();

      renderPage(store);
      openSavedTab();
      fireEvent.change(await screen.findByLabelText("Name"), {
        target: { value: "From the page" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Save as new/ }));

      await waitFor(async () => {
        expect((await store.list())[0]?.name).toBe("From the page");
      });
      expect((await store.list())[0]?.source).toContain("flowchart TD");
    });
  });
});
