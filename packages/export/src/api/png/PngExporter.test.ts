import { describe, expect, it } from "vitest";

import { PngExporter } from "./PngExporter";
import type { Rasterizer } from "./Rasterizer";

describe("PngExporter", () => {
  it("scales the requested size before rasterizing", async () => {
    const calls: [string, number, number][] = [];
    const rasterizer: Rasterizer = {
      rasterize: (svg, width, height) => {
        calls.push([svg, width, height]);
        return Promise.resolve(new Blob(["png"], { type: "image/png" }));
      },
    };

    const blob = await new PngExporter(rasterizer).export(
      "<svg/>",
      { width: 100.4, height: 50 },
      2,
    );

    expect(calls).toEqual([["<svg/>", 201, 100]]);
    expect(blob.type).toBe("image/png");
  });
});
