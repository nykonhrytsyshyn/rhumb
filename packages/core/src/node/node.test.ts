import { describe, expect, it } from "vitest";

import { check, createRhumb, render, renderImage } from ".";
import { DiagramSyntaxError, ExportOptionError } from "..";

const SOURCE = `flowchart TD
  start(["Start"]) --> work["x = 1"]
  work --> done(["Stop"])`;

const PNG_SIGNATURE = "89504e47";
const JPEG_SIGNATURE = "ffd8ff";

function hex(bytes: Uint8Array, length: number): string {
  return [...bytes.slice(0, length)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

describe("render", () => {
  it("draws SVG with the default built-in standard", async () => {
    const { svg, size, profile } = await render(SOURCE);

    expect(svg.startsWith("<svg")).toBe(true);
    expect(size.width).toBeGreaterThan(0);
    expect(profile.default).toBe(true);
  });

  it("applies a preset and lets own colours win over it", async () => {
    const { svg } = await render(SOURCE, { preset: "dark", ink: "#ff0000" });

    expect(svg).toContain("#101014");
    expect(svg).toContain("#ff0000");
  });

  it("adds padding to the size of the drawing", async () => {
    const plain = await render(SOURCE);
    const padded = await render(SOURCE, { padding: 20 });

    expect(padded.size.width).toBe(plain.size.width + 40);
    expect(padded.size.height).toBe(plain.size.height + 40);
  });

  it("picks a profile by id", async () => {
    const [, second] = createRhumb().profiles();

    expect(second).toBeDefined();
    expect((await render(SOURCE, { profile: second?.id })).profile.id).toBe(
      second?.id,
    );
  });

  it("rejects unknown profiles, bad options and bad sources", async () => {
    await expect(render(SOURCE, { profile: "nope" })).rejects.toThrow(/nope/);
    await expect(render(SOURCE, { padding: -1 })).rejects.toBeInstanceOf(
      ExportOptionError,
    );
    await expect(render("flowchart TD\n a -->")).rejects.toBeInstanceOf(
      DiagramSyntaxError,
    );
  });
});

describe("renderImage", () => {
  it("draws a PNG at the requested density", async () => {
    const image = await renderImage(SOURCE, { scale: 3 });
    const { size } = await render(SOURCE);

    expect(image.mime).toBe("image/png");
    expect(image.width).toBe(Math.round(size.width * 3));
    expect(hex(await image.bytes(), 4)).toBe(PNG_SIGNATURE);
  });

  it("draws a JPEG with a solid page", async () => {
    const image = await renderImage(SOURCE, { format: "jpeg", quality: 80 });

    expect(hex(await image.bytes(), 3)).toBe(JPEG_SIGNATURE);
  });

  it("refuses images no canvas could hold", async () => {
    await expect(
      renderImage(SOURCE, { scale: 4, pixelsPerMm: 400 }),
    ).rejects.toBeInstanceOf(RangeError);
  });
});

describe("check", () => {
  it("counts what a valid diagram holds", () => {
    expect(check(SOURCE)).toEqual({ ok: true, nodes: 3, edges: 2 });
  });

  it("reports the line of a syntax problem without the line prefix", () => {
    const result = check("flowchart TD\n  a -->");

    expect(result).toMatchObject({ ok: false, line: 2 });
    expect(result.ok ? "" : result.message).not.toMatch(/^Line/);
  });
});

describe("fonts", () => {
  const family = "Test Font";
  const profile = {
    ...createRhumb().profile("gost-19.701-90"),
    font: {
      ...createRhumb().profile("gost-19.701-90").font,
      family: `'${family}', Arial, sans-serif`,
    },
  };
  const woff2 = { family, data: Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 1]) };

  it("embeds a font that the profile names, and no other", async () => {
    const rhumb = createRhumb({
      fonts: [woff2, { family: "Other", data: woff2.data }],
    });
    const { svg } = await rhumb.render(SOURCE, { profile });

    expect(svg).toContain("@font-face");
    expect(svg).toContain(family);
    expect(svg).not.toContain("Other");
  });

  it("takes fonts per call as well", async () => {
    const { svg } = await createRhumb().render(SOURCE, {
      profile,
      fonts: [woff2],
    });

    expect(svg).toContain("font/woff2");
  });

  it("explains that images cannot use WOFF2 files in Node.js", async () => {
    await expect(
      createRhumb({ fonts: [woff2] }).renderImage(SOURCE, { profile }),
    ).rejects.toThrow(/TTF or OTF/);
  });
});
