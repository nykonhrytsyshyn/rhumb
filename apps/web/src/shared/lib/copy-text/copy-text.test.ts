import { afterEach, describe, expect, it, vi } from "vitest";

import { copyText } from "./copy-text";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("copyText", () => {
  it("writes a clipboard item built from the pending text", async () => {
    const write = vi.fn<(items: unknown[]) => Promise<void>>(() =>
      Promise.resolve(),
    );
    const made: Record<string, Promise<Blob>>[] = [];

    class FakeClipboardItem {
      public constructor(data: Record<string, Promise<Blob>>) {
        made.push(data);
      }
    }

    vi.stubGlobal("navigator", { clipboard: { write, writeText: vi.fn() } });
    vi.stubGlobal("ClipboardItem", FakeClipboardItem);

    await copyText(Promise.resolve("hello"));

    expect(write).toHaveBeenCalledTimes(1);

    const blob = await made[0]?.["text/plain"];

    expect(await blob?.text()).toBe("hello");
  });

  it("falls back to writeText where there are no clipboard items", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(() =>
      Promise.resolve(),
    );

    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("ClipboardItem", undefined);

    await copyText("plain");

    expect(writeText).toHaveBeenCalledWith("plain");
  });

  it("fails clearly when there is no clipboard", async () => {
    vi.stubGlobal("navigator", {});

    await expect(copyText("x")).rejects.toThrow("clipboard");
  });
});
