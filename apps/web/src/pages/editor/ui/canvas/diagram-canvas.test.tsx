import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RenderState } from "../../model/use-rendered-diagram";
import { DiagramCanvas } from "./diagram-canvas";

const READY: RenderState = {
  svg: '<svg data-test="drawing"></svg>',
  size: { width: 100, height: 50 },
  error: null,
  pending: false,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderCanvas(
  state: RenderState,
  overrides: {
    panelOpen?: boolean;
    onPanelOpenChange?: (open: boolean) => void;
  } = {},
) {
  return render(
    <DiagramCanvas
      state={state}
      panelOpen={overrides.panelOpen ?? true}
      onPanelOpenChange={overrides.onPanelOpenChange ?? vi.fn()}
      fitKey={0}
      footer={<span>footer</span>}
    />,
  );
}

describe("DiagramCanvas", () => {
  it("shows the drawing inline so it can follow the theme", () => {
    const { container } = renderCanvas(READY);

    expect(screen.getByRole("img", { name: "Flowchart" })).toBeDefined();
    expect(container.querySelector('svg[data-test="drawing"]')).not.toBeNull();
  });

  it("explains an empty canvas and one that has an error", () => {
    const empty = renderCanvas({ ...READY, svg: null, size: null });

    expect(screen.getByText("The diagram will appear here.")).toBeDefined();
    empty.unmount();

    renderCanvas({ ...READY, svg: null, size: null, error: "Line 1: boom" });
    expect(
      screen.getByText("Fix the source to build the diagram."),
    ).toBeDefined();
  });

  it("keeps the last drawing and flags a newer error", () => {
    renderCanvas({ ...READY, error: "Line 2: boom" });
    expect(screen.getByRole("status").textContent).toContain(
      "Fix the source to build the diagram.",
    );
    expect(screen.getByRole("img", { name: "Flowchart" })).toBeDefined();
  });

  it("announces that it is updating", () => {
    renderCanvas({ ...READY, pending: true });
    expect(screen.getByText("Updating…")).toBeDefined();
  });

  it("offers view controls and a footer slot", () => {
    renderCanvas(READY);

    for (const name of [
      "Fit to screen",
      "Zoom out",
      "Zoom in",
      "Toggle fullscreen",
    ]) {
      expect(screen.getByRole("button", { name })).toBeDefined();
    }

    expect(screen.getByText("footer")).toBeDefined();
  });

  it("toggles the grid", () => {
    renderCanvas(READY);

    const grid = screen.getByRole("button", { name: "Toggle grid" });

    expect(grid.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(grid);
    expect(grid.getAttribute("aria-pressed")).toBe("false");
  });

  it("asks to open or close the panel", () => {
    const onPanelOpenChange = vi.fn();
    const { unmount } = renderCanvas(READY, { onPanelOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onPanelOpenChange).toHaveBeenLastCalledWith(false);
    unmount();

    renderCanvas(READY, { panelOpen: false, onPanelOpenChange });
    fireEvent.click(screen.getByRole("button", { name: "Open panel" }));
    expect(onPanelOpenChange).toHaveBeenLastCalledWith(true);
  });

  it("enters and leaves fullscreen", () => {
    const request = vi.fn(() => Promise.resolve());
    const exit = vi.fn(() => Promise.resolve());

    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: request,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exit,
    });
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: null,
    });
    renderCanvas(READY);
    fireEvent.click(screen.getByRole("button", { name: "Toggle fullscreen" }));
    expect(request).toHaveBeenCalledOnce();

    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: document.body,
    });
    fireEvent.click(screen.getByRole("button", { name: "Toggle fullscreen" }));
    expect(exit).toHaveBeenCalledOnce();
  });
});
