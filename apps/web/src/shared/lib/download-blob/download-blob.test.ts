import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadBlob } from "./download-blob";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("downloadBlob", () => {
  it("clicks a temporary link with the file name and frees the URL", () => {
    const revoke = vi.fn();
    URL.createObjectURL = vi.fn(() => "blob:test");
    URL.revokeObjectURL = revoke;
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    downloadBlob(new Blob(["x"]), "scheme.svg");
    expect(click).toHaveBeenCalledOnce();

    const link = click.mock.contexts[0] as HTMLAnchorElement;

    expect(link.download).toBe("scheme.svg");
    expect(link.href).toBe("blob:test");
    expect(revoke).toHaveBeenCalledWith("blob:test");
  });
});
