import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { memoryStorage } from "@shared/lib/testing/memory-storage";

import { copyPng, exportPng, exportSvg } from "../../lib/export-diagram";
import { ProfileCatalog } from "../../model/profile-catalog";
import { useProfileEditor } from "../../model/use-profile-editor";
import { EditorPanel, type EditorPanelProps } from "./editor-panel";

vi.mock("./source-editor", () => ({
  default: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <textarea
      aria-label={label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  ),
}));
vi.mock("../../lib/export-diagram", () => ({
  exportPng: vi.fn(() => Promise.resolve()),
  exportSvg: vi.fn(() => Promise.resolve()),
  copyPng: vi.fn(() => Promise.resolve()),
  downloadProfile: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
  vi.clearAllMocks();
});

const catalog = new ProfileCatalog(memoryStorage());
const defaultProfile = catalog.getSnapshot()[0];

type PanelProps = Omit<EditorPanelProps, "editor">;

function Harness(props: PanelProps) {
  const editor = useProfileEditor(catalog);

  return <EditorPanel {...props} editor={editor} />;
}

function renderPanel(overrides: Partial<PanelProps> = {}) {
  const props: PanelProps = {
    open: true,
    onOpenChange: vi.fn(),
    source: "flowchart TD\nA --> B",
    onSourceChange: vi.fn(),
    error: null,
    onProfileSelect: vi.fn(),
    onSampleSelect: vi.fn(),
    currentDiagramId: null,
    onCurrentDiagramChange: vi.fn(),
    onOpenDiagram: vi.fn(),
    ...overrides,
  };

  render(<Harness {...props} />);

  return props;
}

describe("EditorPanel", () => {
  it("edits the source on the code tab", async () => {
    const props = renderPanel();
    const editor = await screen.findByLabelText("Diagram source");

    fireEvent.change(editor, { target: { value: "flowchart LR" } });
    expect(props.onSourceChange).toHaveBeenCalledWith("flowchart LR");
  });

  it("shows the syntax error under the editor", async () => {
    renderPanel({ error: "Line 2: Expected a link" });
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Line 2: Expected a link",
    );
  });

  it("switches between code, config and docs", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("tab", { name: /Docs/ }));
    expect(await screen.findByText("Blocks")).toBeDefined();
    expect(screen.getByText("Loops")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: /Config/ }));
    expect(await screen.findByText("Standard")).toBeDefined();
  });

  it("loads a sample into the editor in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const props = renderPanel();

    fireEvent.click(screen.getByText("Sample diagrams"));
    fireEvent.click(await screen.findByRole("button", { name: "Branching" }));
    expect(props.onSampleSelect).toHaveBeenCalledOnce();
    expect(vi.mocked(props.onSampleSelect).mock.calls[0]?.[0]).toContain(
      "check{",
    );
  });

  it("exports with the chosen options", async () => {
    const props = renderPanel();

    fireEvent.click(
      screen.getByRole("switch", { name: "Transparent background" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /PNG/ }));
    await waitFor(() => {
      expect(exportPng).toHaveBeenCalledWith(props.source, defaultProfile, {
        transparent: true,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: /SVG/ }));
    await waitFor(() => {
      expect(exportSvg).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Copy image/ }));
    expect(await screen.findByText("Copied")).toBeDefined();
    expect(copyPng).toHaveBeenCalled();
  });

  it("shows why an export failed", async () => {
    vi.mocked(exportSvg).mockRejectedValueOnce(new Error("no canvas"));
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /SVG/ }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Export failed: no canvas",
    );

    vi.mocked(exportPng).mockRejectedValueOnce("plain");
    fireEvent.click(screen.getByRole("button", { name: /PNG/ }));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Export failed: plain",
      );
    });
  });

  it("reports whether the panel is open on its handle", () => {
    renderPanel({ open: false });

    const handle = screen.getByRole("button", { name: "Toggle panel" });

    expect(handle.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles from the keyboard", () => {
    const props = renderPanel({ open: false });
    const handle = screen.getByRole("button", { name: "Toggle panel" });

    fireEvent.keyDown(handle, { key: "Enter" });
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "a" });

    expect(props.onOpenChange).toHaveBeenCalledTimes(2);
    expect(props.onOpenChange).toHaveBeenLastCalledWith(true);
  });
});
