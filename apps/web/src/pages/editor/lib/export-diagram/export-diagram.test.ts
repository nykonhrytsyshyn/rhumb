import type { FontSource, Rhumb } from "@nykon/rhumb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EXPORT_SETTINGS, type ExportSettings } from "@rhumb/export";
import { ProfileRegistry } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import {
  copyImage,
  copySvg,
  defaultExportName,
  downloadProfile,
  exportImage,
} from ".";
import { loadEmbeddedFonts } from "./load-embedded-fonts";

const rhumb = vi.hoisted(() => ({
  render: vi.fn<Rhumb["render"]>(),
  renderImage: vi.fn<Rhumb["renderImage"]>(),
}));

vi.mock("../../api/rhumb", () => ({ rhumb }));
vi.mock("@shared/lib/download-blob", () => ({ downloadBlob: vi.fn() }));
vi.mock("./load-embedded-fonts", () => ({ loadEmbeddedFonts: vi.fn() }));

const profile = ProfileRegistry.withBuiltins().default();

const FONT: FontSource = { family: "OpenGost Type A", data: new Uint8Array() };

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

beforeEach(() => {
  vi.mocked(loadEmbeddedFonts).mockResolvedValue([FONT]);
  vi.mocked(rhumb.render).mockResolvedValue({
    svg: "<svg/>",
    size: { width: 10, height: 5 },
    profile,
  });
  vi.mocked(rhumb.renderImage).mockResolvedValue({
    blob: new Blob(["img"], { type: "image/png" }),
    format: "png",
    mime: "image/png",
    width: 20,
    height: 10,
    bytes: () => Promise.resolve(new Uint8Array()),
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("export-diagram", () => {
  it("hands the settings, the profile and the site fonts to the library", async () => {
    const chosen = settings({
      format: "svg",
      ink: "#112233",
      fill: "#445566",
      background: "#778899",
      padding: 8,
    });

    await exportImage("src", profile, chosen);

    expect(rhumb.render).toHaveBeenCalledWith("src", {
      ...chosen,
      profile,
      fonts: [FONT],
    });
  });

  it("downloads an SVG under the name of the setting, then the default", async () => {
    await exportImage("src", profile, settings({ format: "svg" }));

    const { blob, name } = lastDownload();

    expect(name).toMatch(/^rhumb-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.svg$/);
    expect(blob.type).toBe("image/svg+xml");
    expect(await blob.text()).toBe("<svg/>");
  });

  it("names the file after the setting, falling back to the standard", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "jpeg", fileName: "my / chart" }),
    );

    expect(lastDownload().name).toBe("my - chart.jpg");
  });

  it("uses the saved diagram name when given and cleans unsafe characters", async () => {
    await exportImage(
      "src",
      profile,
      settings({ format: "svg" }),
      defaultExportName("Lab 5 / Task 1"),
    );

    expect(lastDownload().name).toBe("Lab 5 - Task 1.svg");
  });

  it("asks the library for the chosen raster format and downloads it", async () => {
    const chosen = settings({ format: "webp", scale: 3, quality: 80 });

    await exportImage("src", profile, chosen);

    expect(rhumb.renderImage).toHaveBeenCalledWith("src", {
      ...chosen,
      profile,
      fonts: [FONT],
      format: "webp",
    });
    expect(rhumb.render).not.toHaveBeenCalled();
    expect(lastDownload().name).toMatch(/\.webp$/);
  });

  it("copies the SVG text", async () => {
    const text = vi.fn(() => Promise.resolve());

    vi.stubGlobal("navigator", { clipboard: { writeText: text } });
    await copySvg("src", profile, settings({ format: "svg" }));

    expect(text).toHaveBeenCalledWith("<svg/>");
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
    expect(rhumb.renderImage).toHaveBeenCalledWith(
      "src",
      expect.objectContaining({ format: "png" }),
    );
  });

  it("saves a profile as pretty JSON", () => {
    downloadProfile(profile);

    const { blob, name } = lastDownload();

    expect(name).toBe(`${profile.title}.json`);
    expect(blob.type).toBe("application/json");
  });
});
