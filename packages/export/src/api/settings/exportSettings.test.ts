import { describe, expect, it } from "vitest";

import { DEFAULT_EXPORT_SETTINGS } from "./defaultExportSettings";
import { exceedsRasterLimit, exportDimensions } from "./exportDimensions";
import { exportFileName } from "./exportFileName";
import { EXPORT_PRESETS } from "./exportPresets";
import { matchPreset } from "./matchPreset";
import { parseExportSettings } from "./parseExportSettings";
import { toAppearance } from "./toAppearance";

describe("parseExportSettings", () => {
  it("round-trips valid settings", () => {
    const saved = {
      ...DEFAULT_EXPORT_SETTINGS,
      format: "webp",
      scale: 3,
      quality: 70,
      ink: "#123456",
      padding: 24,
      radius: 8,
      fileName: "chart",
    } as const;

    expect(parseExportSettings(JSON.stringify(saved))).toEqual(saved);
  });

  it("falls back to the defaults for garbage", () => {
    expect(parseExportSettings("not json")).toEqual(DEFAULT_EXPORT_SETTINGS);
    expect(parseExportSettings("[1,2]")).toEqual(DEFAULT_EXPORT_SETTINGS);
    expect(parseExportSettings("null")).toEqual(DEFAULT_EXPORT_SETTINGS);
  });

  it("repairs each bad field on its own", () => {
    const parsed = parseExportSettings(
      JSON.stringify({
        format: "gif",
        scale: 9,
        quality: 5,
        ink: "red",
        padding: 9999,
        radius: -4,
        transparent: "yes",
        background: "#ABC",
        fileName: "kept",
      }),
    );

    expect(parsed).toEqual({
      ...DEFAULT_EXPORT_SETTINGS,
      quality: 50,
      padding: 96,
      radius: 0,
      background: "#aabbcc",
      fileName: "kept",
    });
  });
});

describe("matchPreset", () => {
  it("recognises each preset by its colours", () => {
    for (const [id, colors] of Object.entries(EXPORT_PRESETS)) {
      expect(matchPreset({ ...DEFAULT_EXPORT_SETTINGS, ...colors })).toBe(id);
    }
  });

  it("reports null once a colour was edited", () => {
    expect(
      matchPreset({ ...DEFAULT_EXPORT_SETTINGS, ink: "#010101" }),
    ).toBeNull();
  });

  it("ignores the page colour while the page is transparent", () => {
    expect(
      matchPreset({
        ...DEFAULT_EXPORT_SETTINGS,
        ...EXPORT_PRESETS.clear,
        background: "#123456",
      }),
    ).toBe("clear");
  });
});

describe("toAppearance", () => {
  it("backs labels with the page colour", () => {
    expect(
      toAppearance({ ...DEFAULT_EXPORT_SETTINGS, background: "#222222" }),
    ).toEqual({
      ink: "#000000",
      fill: "#ffffff",
      background: null,
      labelBackground: "#222222",
    });
  });

  it("backs labels with the blocks when there is no page", () => {
    expect(
      toAppearance({
        ...DEFAULT_EXPORT_SETTINGS,
        transparent: true,
        fill: "#eeeeee",
      }).labelBackground,
    ).toBe("#eeeeee");
  });

  it("backs labels against the ink when nothing else is solid", () => {
    expect(
      toAppearance({
        ...DEFAULT_EXPORT_SETTINGS,
        transparent: true,
        hollow: true,
        ink: "#ffffff",
      }),
    ).toMatchObject({ fill: "none", labelBackground: "#000000" });
  });
});

describe("export dimensions", () => {
  const size = { width: 100, height: 50 };

  it("scales rasters and counts the padding", () => {
    expect(
      exportDimensions(size, {
        ...DEFAULT_EXPORT_SETTINGS,
        scale: 3,
        padding: 10,
      }),
    ).toEqual({ width: 360, height: 210 });
  });

  it("does not scale SVG", () => {
    expect(
      exportDimensions(size, { ...DEFAULT_EXPORT_SETTINGS, format: "svg" }),
    ).toEqual(size);
  });

  it("flags rasters that no canvas could hold, but never SVG", () => {
    const huge = { width: 9000, height: 100 };
    const settings = { ...DEFAULT_EXPORT_SETTINGS, scale: 4 } as const;

    expect(exceedsRasterLimit(huge, settings)).toBe(true);
    expect(exceedsRasterLimit(huge, { ...settings, format: "svg" })).toBe(
      false,
    );
    expect(exceedsRasterLimit(size, settings)).toBe(false);
  });
});

describe("exportFileName", () => {
  it("uses the typed name and the format's extension", () => {
    expect(
      exportFileName("gost", {
        ...DEFAULT_EXPORT_SETTINGS,
        format: "jpeg",
        fileName: "scheme",
      }),
    ).toBe("scheme.jpg");
  });

  it("falls back to the standard when the name is empty", () => {
    expect(exportFileName("gost", DEFAULT_EXPORT_SETTINGS)).toBe("gost.png");
  });
});
