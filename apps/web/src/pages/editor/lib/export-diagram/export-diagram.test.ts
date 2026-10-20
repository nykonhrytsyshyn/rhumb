import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import { copyPng, downloadProfile, exportPng, exportSvg } from ".";
import { renderDiagram } from "../../api/render-diagram";

vi.mock("../../api/render-diagram", () => ({ renderDiagram: vi.fn() }));
vi.mock("@shared/lib/download-blob", () => ({ downloadBlob: vi.fn() }));
vi.mock("@rhumb/export", () => ({
  CanvasRasterizer: class {
    public readonly background: string | null;

    public constructor(background: string | null) {
      this.background = background;
    }
  },
  PngExporter: class {
    private readonly rasterizer: { background: string | null };

    public constructor(rasterizer: { background: string | null }) {
      this.rasterizer = rasterizer;
    }

    public export(): Promise<Blob> {
      return Promise.resolve(
        new Blob([String(this.rasterizer.background)], { type: "image/png" }),
      );
    }
  },
}));

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

function lastDownload(): { blob: Blob; name: string } {
  const call = vi.mocked(downloadBlob).mock.calls[0];

  if (call === undefined) {
    throw new Error("Nothing was downloaded");
  }

  return { blob: call[0], name: call[1] };
}

beforeEach(() => {
  vi.mocked(renderDiagram).mockResolvedValue({
    svg: "<svg/>",
    size: { width: 10, height: 5 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("export-diagram", () => {
  it("draws exports in print colours with a white page", async () => {
    await exportSvg("src", profile, {
      transparent: false,
    });
    expect(renderDiagram).toHaveBeenCalledWith("src", profile, {
      appearance: {
        ink: "#000000",
        fill: "#ffffff",
        background: "#ffffff",
        labelBackground: "#ffffff",
      },
    });

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.id}.svg`);
    expect(blob.type).toBe("image/svg+xml");
  });

  it("drops the page for transparent exports", async () => {
    await exportSvg("src", profile, {
      transparent: true,
    });
    expect(vi.mocked(renderDiagram).mock.calls[0]?.[2]).toMatchObject({
      appearance: { background: null },
    });
  });

  it("downloads a PNG with the matching background", async () => {
    await exportPng("src", profile, {
      transparent: true,
    });

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.id}.png`);
    expect(await blob.text()).toBe("null");
  });

  it("copies the PNG to the clipboard", async () => {
    const write = vi.fn(() => Promise.resolve());

    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal(
      "ClipboardItem",
      class {
        public readonly items: Record<string, Blob>;

        public constructor(items: Record<string, Blob>) {
          this.items = items;
        }
      },
    );

    await copyPng("src", profile, { transparent: false });
    expect(write).toHaveBeenCalledOnce();
  });

  it("saves a profile as pretty JSON", () => {
    downloadProfile(profile);

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.id}.json`);
    expect(blob.type).toBe("application/json");
  });
});
