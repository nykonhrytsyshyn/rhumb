import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileRegistry, type StandardProfile } from "@rhumb/profiles";

const base = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

function withFont(family: string): StandardProfile {
  return { ...base, font: { ...base.font, family } };
}

function stubFetch(body: Uint8Array, ok = true) {
  const fetchMock = vi.fn(() =>
    Promise.resolve({
      ok,
      arrayBuffer: () => Promise.resolve(body.buffer),
    }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

/** The loader remembers what it downloaded, so every test gets a fresh one. */
async function freshLoader() {
  vi.resetModules();

  return (await import("./load-embedded-fonts")).loadEmbeddedFonts;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadEmbeddedFonts", () => {
  it("loads nothing for fonts the site does not ship", async () => {
    const fetchMock = stubFetch(new Uint8Array());
    const loadEmbeddedFonts = await freshLoader();

    expect(await loadEmbeddedFonts(withFont("'GOST type A', Arial"))).toEqual(
      [],
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads the site font a stack asks for, as base64", async () => {
    const fetchMock = stubFetch(new Uint8Array([65, 66, 67]));
    const loadEmbeddedFonts = await freshLoader();

    const fonts = await loadEmbeddedFonts(
      withFont("Arial, 'OpenGost Type B', sans-serif"),
    );

    expect(fonts).toEqual([
      {
        family: "OpenGost Type B",
        data: "QUJD",
        format: "woff2",
        weight: "400",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("downloads a font once and reuses it", async () => {
    const fetchMock = stubFetch(new Uint8Array([1]));
    const loadEmbeddedFonts = await freshLoader();
    const profile = withFont("'JetBrains Mono Variable', monospace");

    await loadEmbeddedFonts(profile);
    await loadEmbeddedFonts(profile);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("loads every site font of the stack", async () => {
    stubFetch(new Uint8Array([1]));
    const loadEmbeddedFonts = await freshLoader();

    const fonts = await loadEmbeddedFonts(
      withFont("'OpenGost Type A', 'OpenGost Type B'"),
    );

    expect(fonts.map((font) => font.family)).toEqual([
      "OpenGost Type A",
      "OpenGost Type B",
    ]);
  });

  it("carries on without a font that cannot be downloaded, and retries later", async () => {
    const loadEmbeddedFonts = await freshLoader();
    const profile = withFont("'Inter Variable', Arial");

    stubFetch(new Uint8Array(), false);
    expect(await loadEmbeddedFonts(profile)).toEqual([]);

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    expect(await loadEmbeddedFonts(profile)).toEqual([]);

    stubFetch(new Uint8Array([65]));
    expect(await loadEmbeddedFonts(profile)).toMatchObject([
      { family: "Inter Variable", data: "QQ==" },
    ]);
  });
});
