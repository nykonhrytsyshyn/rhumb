import { beforeEach, vi } from "vitest";

/** jsdom has no ResizeObserver, which the pan/zoom canvas relies on. */
class ResizeObserverStub {
  public readonly observe = vi.fn();
  public readonly unobserve = vi.fn();
  public readonly disconnect = vi.fn();
}

// Registered before every test because tests may call `unstubAllGlobals`.
beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});
