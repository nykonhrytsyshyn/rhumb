import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as RhumbExport from "@rhumb/export";
import { DEFAULT_EXPORT_SETTINGS, type ExportSettings } from "@rhumb/export";
import { ProfileRegistry } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import { copyImage, downloadProfile, exportImage } from ".";
import { renderDiagram } from "../../api/render-diagram";

vi.mock("../../api/render-diagram", () => ({ renderDiagram: vi.fn() }));
vi.mock("@shared/lib/download-blob", () => ({ downloadBlob: vi.fn() }));

const rasterized: {
  matte: string | null;
  size: [number, number];
  options: unknown;
}[] = [];

vi.mock("@rhumb/export", async (importOriginal) => {
  const original = await importOriginal<typeof RhumbExport>();

  return {
    ...original,
    CanvasRasterizer: class {
      private readonly matte: string | null;

      public constructor(matte: string | null) {
        this.matte = matte;
      }

      public rasterize(
        _svg: string,
        width: number,
        height: number,
        options: unknown,
      ): Promise<Blob> {
        rasterized.push({ matte: this.matte, size: [width, height], options });

        return Promise.resolve(new Blob(["img"], { type: "image/png" }));
      }
    },
  };
});

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

const DRAWING =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5"/>';

function settings(patch: Partial<ExportSettings> = {}): ExportSettings {
  return { ...DEFAULT_EXPORT_SETTINGS, ...patch };
}

function lastDownload(): { blob: Blob; name: string } {
  const call = vi.mocked(downloadBlob).mock.calls[0];

  if (call === undefined) {
    throw new Error("Nothing was downloaded");
  }

  return { blob: call[0], name: call[1] };
}

function appearanceOf(): Record<string, unknown> {
  const options = vi.mocked(renderDiagram).mock.calls[0]?.[2];

  return { ...options?.appearance };
}

beforeEach(() => {
  rasterized.length = 0;
  vi.mocked(renderDiagram).mockResolvedValue({
    svg: DRAWING,
    size: { width: 10, height: 5 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("export-diagram", () => {
  it("draws the chosen colours and leaves the page to the frame", async () => {
    await exportImage(
      "src",
      profile,
      settings({
        format: "svg",
        ink: "#112233",
        fill: "#445566",
        background: "#778899",
      }),
    );

    expect(appearanceOf()).toEqual({
      ink: "#112233",
      fill: "#445566",
      background: null,
      labelBackground: "#778899",
    });

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.id}.svg`);
    expect(blob.type).toBe("image/svg+xml");
    expect(await blob.text()).toContain('fill="#778899"');
  });

  it("makes blocks see-through when they are hollow", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "svg", hollow: true }),
    );

    expect(appearanceOf()).toMatchObject({ fill: "none" });
  });

  it("drops the page for transparent exports", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "svg", transparent: true, radius: 12 }),
    );

    expect(await lastDownload().blob.text()).toBe(DRAWING);
  });

  it("adds padding around the drawing", async () => {
    await exportImage("src", profile, settings({ format: "svg", padding: 8 }));

    const text = await lastDownload().blob.text();

    expect(text).toContain('viewBox="0 0 26 21"');
  });

  it("names the file after the setting, falling back to the standard", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "jpeg", fileName: "my / chart" }),
    );

    expect(lastDownload().name).toBe("my - chart.jpg");
  });

  it("scales rasters and passes the quality on", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "webp", scale: 3, quality: 80, transparent: true }),
    );

    expect(rasterized).toEqual([
      {
        matte: null,
        size: [30, 15],
        options: { format: "webp", quality: 0.8 },
      },
    ]);
    expect(lastDownload().name).toBe(`${profile.id}.webp`);
  });

  it("gives JPEG a solid page because it cannot be see-through", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "jpeg", background: "#102030" }),
    );
    await exportImage(
      "src",
      profile,
      settings({ format: "jpeg", transparent: true }),
    );

    expect(rasterized.map((item) => item.matte)).toEqual([
      "#102030",
      "#ffffff",
    ]);
  });

  it("copies a PNG to the clipboard whatever the format is", async () => {
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

    await copyImage("src", profile, settings({ format: "svg" }));

    expect(write).toHaveBeenCalledOnce();
    expect(rasterized[0]?.options).toMatchObject({ format: "png" });
  });

  it("saves a profile as pretty JSON", () => {
    downloadProfile(profile);

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.id}.json`);
    expect(blob.type).toBe("application/json");
  });
});
