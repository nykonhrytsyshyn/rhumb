import { describe, expect, it } from "vitest";

import { RasterExporter } from "./RasterExporter";
import type { RasterOptions, Rasterizer } from "./Rasterizer";

function recorder(): {
  readonly calls: [string, number, number, RasterOptions][];
  readonly rasterizer: Rasterizer;
} {
  const calls: [string, number, number, RasterOptions][] = [];

  return {
    calls,
    rasterizer: {
      rasterize: (svg, width, height, options) => {
        calls.push([svg, width, height, options]);

        return Promise.resolve(new Blob(["img"], { type: "image/png" }));
      },
    },
  };
}

describe("RasterExporter", () => {
  it("scales the requested size before rasterizing", async () => {
    const { calls, rasterizer } = recorder();
    const blob = await new RasterExporter(rasterizer).export(
      "<svg/>",
      { width: 100.4, height: 50 },
      2,
    );

    expect(calls).toEqual([["<svg/>", 201, 100, { format: "png" }]]);
    expect(blob.type).toBe("image/png");
  });

  it("passes the format and quality on to the rasterizer", async () => {
    const { calls, rasterizer } = recorder();

    await new RasterExporter(rasterizer).export(
      "<svg/>",
      { width: 10, height: 10 },
      3,
      { format: "jpeg", quality: 0.8 },
    );

    expect(calls[0]?.[3]).toEqual({ format: "jpeg", quality: 0.8 });
    expect(calls[0]?.[1]).toBe(30);
  });
});
