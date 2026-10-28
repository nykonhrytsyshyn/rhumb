import type { JSX } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScrollMemory } from "./use-scroll-memory";

function Tab({ id }: { readonly id: string }): JSX.Element {
  const ref = useScrollMemory(id);

  return <div ref={ref}>content</div>;
}

function scroller(): HTMLElement {
  const element = document.createElement("div");

  element.style.overflowY = "auto";
  document.body.append(element);

  return element;
}

describe("useScrollMemory", () => {
  it("scrolls a returning tab back to where it was left", () => {
    const parent = scroller();
    const first = render(<Tab id="back" />, { container: parent });

    parent.scrollTop = 120;
    parent.dispatchEvent(new Event("scroll"));
    first.unmount();

    const returned = scroller();
    const again = render(<Tab id="back" />, { container: returned });

    expect(returned.scrollTop).toBe(120);

    again.unmount();
  });

  it("starts a tab nobody has seen at the top", () => {
    const parent = scroller();

    parent.scrollTop = 80;
    render(<Tab id="fresh" />, { container: parent });

    expect(parent.scrollTop).toBe(0);
  });
});
