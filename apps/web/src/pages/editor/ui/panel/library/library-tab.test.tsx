import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderDiagram } from "../../../api/render-diagram";
import { downloadBlob } from "../../../lib/download";
import type * as DiagramStoreModule from "../../../model/diagram-store";
import type { SavedDiagram } from "../../../model/diagram-store";
import { MemoryDiagramStore } from "../../../model/memory-diagram-store";
import { LibraryTab, type LibraryTabProps } from "./library-tab";

vi.mock("../../../api/render-diagram", () => ({ renderDiagram: vi.fn() }));
vi.mock("../../../lib/download", () => ({ downloadBlob: vi.fn() }));
vi.mock("../../../model/diagram-store", async (importOriginal) => ({
  ...(await importOriginal<typeof DiagramStoreModule>()),
  requestPersistentStorage: vi.fn(() => Promise.resolve(true)),
}));

function saved(id: string, name: string, updatedAt: number): SavedDiagram {
  return {
    id,
    name,
    source: `flowchart TD\n${id} --> Z`,
    profileId: "iso-5807",
    createdAt: updatedAt,
    updatedAt,
  };
}

beforeEach(() => {
  vi.mocked(renderDiagram).mockResolvedValue({
    svg: '<svg data-test="thumb" viewBox="0 0 10 10"></svg>',
    size: { width: 10, height: 10 },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderTab(
  items: readonly SavedDiagram[] = [],
  overrides: Partial<LibraryTabProps> = {},
  store = new MemoryDiagramStore(items),
) {
  const props: LibraryTabProps = {
    store,
    source: "flowchart TD\nA --> B",
    profileId: "gost-19.701-90",
    currentId: null,
    onCurrentChange: vi.fn(),
    onOpen: vi.fn(),
    ...overrides,
  };

  const { container } = render(<LibraryTab {...props} />);

  return { props, store, container };
}

function openMenu(name: string): void {
  const trigger = screen.getByRole("button", {
    name: `Actions for ${name}`,
  });

  fireEvent.pointerDown(trigger);
  fireEvent.click(trigger);
}

async function choose(menuItem: string): Promise<void> {
  fireEvent.click(await screen.findByRole("menuitem", { name: menuItem }));
}

describe("LibraryTab", () => {
  it("says so when nothing has been saved", async () => {
    renderTab();

    expect(screen.getByText("Loading…")).toBeDefined();
    expect(await screen.findByText(/Nothing saved yet/)).toBeDefined();
  });

  it("shows saved diagrams as tiles drawn like the canvas", async () => {
    const { container } = renderTab([
      saved("a", "Alpha", 2),
      saved("b", "Beta", 1),
    ]);

    expect(await screen.findByText("Alpha")).toBeDefined();
    expect(screen.getByText("Beta")).toBeDefined();
    await waitFor(() => {
      expect(container.querySelectorAll("svg[data-test='thumb']")).toHaveLength(
        2,
      );
    });
    expect(container.querySelector("ul")?.className).toContain("grid");
    expect(container.querySelector("li")?.className).toContain("aspect-square");
  });

  it("draws each tile with the standard it was saved with", async () => {
    renderTab([saved("a", "Alpha", 1)]);

    await waitFor(() => {
      expect(renderDiagram).toHaveBeenCalledWith(
        "flowchart TD\na --> Z",
        expect.objectContaining({ default: true }),
      );
    });
  });

  it("explains a tile that cannot be drawn", async () => {
    vi.mocked(renderDiagram).mockRejectedValue(new Error("boom"));
    renderTab([saved("a", "Alpha", 1)]);

    expect(await screen.findByText("Cannot draw this diagram")).toBeDefined();
  });

  it("saves the current diagram as a new one and makes it current", async () => {
    const { props, store } = renderTab();
    await screen.findByText(/Nothing saved yet/);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My scheme" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save as new/ }));

    expect(await screen.findByText("My scheme")).toBeDefined();
    const [stored] = await store.list();

    expect(stored).toMatchObject({
      name: "My scheme",
      source: props.source,
      profileId: "gost-19.701-90",
    });
    expect(props.onCurrentChange).toHaveBeenCalledWith(stored?.id);
    expect(screen.getByLabelText("Name")).toHaveProperty("value", "");
  });

  it("names an unnamed diagram", async () => {
    renderTab();
    await screen.findByText(/Nothing saved yet/);

    fireEvent.click(screen.getByRole("button", { name: /Save as new/ }));

    expect(await screen.findByText("Untitled diagram")).toBeDefined();
  });

  it("cannot save an empty source", async () => {
    renderTab([], { source: "   " });
    await screen.findByText(/Nothing saved yet/);

    expect(screen.getByRole("button", { name: /Save as new/ })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("updates the open diagram with what is in the editor", async () => {
    const { store } = renderTab([saved("a", "Alpha", 1)], {
      currentId: "a",
      source: "flowchart LR\nX --> Y",
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "Update “Alpha”" }),
    );

    await waitFor(async () => {
      expect((await store.list())[0]?.source).toBe("flowchart LR\nX --> Y");
    });
    expect((await store.list())[0]).toMatchObject({
      name: "Alpha",
      profileId: "gost-19.701-90",
    });
  });

  it("offers no update when no saved diagram is open", async () => {
    renderTab([saved("a", "Alpha", 1)]);
    await screen.findByText("Alpha");

    expect(screen.queryByRole("button", { name: /^Update/ })).toBeNull();
  });

  it("marks the open diagram", async () => {
    renderTab([saved("a", "Alpha", 1), saved("b", "Beta", 2)], {
      currentId: "a",
    });

    expect(await screen.findByText("Open now")).toBeDefined();
    expect(screen.getAllByText("Open now")).toHaveLength(1);
  });

  it("opens a diagram when its tile is clicked", async () => {
    const { props } = renderTab([saved("a", "Alpha", 1)]);

    fireEvent.click(await screen.findByRole("button", { name: "Open Alpha" }));

    expect(props.onCurrentChange).toHaveBeenCalledWith("a");
    expect(props.onOpen).toHaveBeenCalledWith(saved("a", "Alpha", 1));
  });

  it("renames from the tile menu and applies the name on Enter", async () => {
    const { store } = renderTab([saved("a", "Alpha", 1)]);
    await screen.findByText("Alpha");

    openMenu("Alpha");
    await choose("Rename");
    const field = await screen.findByLabelText("New name");

    fireEvent.change(field, { target: { value: "Gamma" } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(await screen.findByText("Gamma")).toBeDefined();
    expect((await store.list())[0]?.name).toBe("Gamma");
  });

  it("drops a rename on Escape and ignores an empty name", async () => {
    renderTab([saved("a", "Alpha", 1)]);
    await screen.findByText("Alpha");

    openMenu("Alpha");
    await choose("Rename");
    let field = await screen.findByLabelText("New name");
    fireEvent.change(field, { target: { value: "Gamma" } });
    fireEvent.keyDown(field, { key: "Escape" });

    expect(screen.getByText("Alpha")).toBeDefined();

    openMenu("Alpha");
    await choose("Rename");
    field = await screen.findByLabelText("New name");
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.blur(field);

    expect(await screen.findByText("Alpha")).toBeDefined();
  });

  it("duplicates a diagram", async () => {
    renderTab([saved("a", "Alpha", 1)]);
    await screen.findByText("Alpha");

    openMenu("Alpha");
    await choose("Duplicate");

    expect(await screen.findByText("Alpha (copy)")).toBeDefined();
  });

  it("downloads the source under the name of the diagram", async () => {
    renderTab([saved("a", "Alpha/Beta", 1)]);
    await screen.findByText("Alpha/Beta");

    openMenu("Alpha/Beta");
    await choose("Download source");

    const [blob, fileName] = vi.mocked(downloadBlob).mock.calls[0] ?? [];

    expect(fileName).toBe("Alpha-Beta.mmd");
    expect(await blob?.text()).toBe("flowchart TD\na --> Z");
  });

  it("asks before deleting and then forgets the open diagram", async () => {
    const { props, store } = renderTab([saved("a", "Alpha", 1)], {
      currentId: "a",
    });
    await screen.findByText("Alpha");

    openMenu("Alpha");
    await choose("Delete");

    const dialog = await screen.findByRole("alertdialog");

    expect(within(dialog).getByText("Delete “Alpha”?")).toBeDefined();
    expect(await store.list()).toHaveLength(1);

    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("Alpha")).toBeNull();
    });
    expect(await store.list()).toHaveLength(0);
    expect(props.onCurrentChange).toHaveBeenCalledWith(null);
  });

  it("keeps the diagram when deleting is cancelled", async () => {
    const { store } = renderTab([saved("a", "Alpha", 1)]);
    await screen.findByText("Alpha");

    openMenu("Alpha");
    await choose("Delete");
    fireEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Cancel",
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
    expect(screen.getByText("Alpha")).toBeDefined();
    expect(await store.list()).toHaveLength(1);
  });

  it("filters by name", async () => {
    renderTab([saved("a", "Alpha", 2), saved("b", "Beta", 1)]);
    await screen.findByText("Alpha");

    const search = screen.getByLabelText("Search saved diagrams");

    fireEvent.change(search, { target: { value: "bet" } });
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.getByText("Beta")).toBeDefined();

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.getByText("No diagrams match your search.")).toBeDefined();
  });

  it("shows storage problems", async () => {
    renderTab([], {}, new MemoryDiagramStore([], new Error("quota exceeded")));

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toContain("The browser storage did not work");
    expect(alert.textContent).toContain("quota exceeded");
  });
});
