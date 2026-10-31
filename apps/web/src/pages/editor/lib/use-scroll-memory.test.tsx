// @vitest-environment jsdom
import type { JSX } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { scrollToTop, useScrollMemory } from "./use-scroll-memory";

function Tab({
  id,
  ready = true,
}: {
  readonly id: string;
  readonly ready?: boolean;
}): JSX.Element {
  const ref = useScrollMemory(id, ready);

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

  it("waits for the content before scrolling back", () => {
    const parent = scroller();
    const first = render(<Tab id="late" />, { container: parent });

    parent.scrollTop = 90;
    parent.dispatchEvent(new Event("scroll"));
    first.unmount();

    const returned = scroller();
    const again = render(<Tab id="late" ready={false} />, {
      container: returned,
    });

    returned.scrollTop = 0;
    again.rerender(<Tab id="late" ready />);

    expect(returned.scrollTop).toBe(90);

    again.unmount();
  });

  it("does not forget the position while the content is missing", () => {
    const parent = scroller();
    const first = render(<Tab id="kept" />, { container: parent });

    parent.scrollTop = 60;
    parent.dispatchEvent(new Event("scroll"));
    first.unmount();

    const waiting = scroller();
    const second = render(<Tab id="kept" ready={false} />, {
      container: waiting,
    });

    second.unmount();

    const returned = scroller();
    const third = render(<Tab id="kept" />, { container: returned });

    expect(returned.scrollTop).toBe(60);

    third.unmount();
  });
});

describe("scrollToTop", () => {
  it("scrolls the area around the element to the top", () => {
    const parent = scroller();
    const view = render(<Tab id="top" />, { container: parent });

    parent.scrollTop = 200;
    scrollToTop(view.getByText("content"));

    expect(parent.scrollTop).toBe(0);

    view.unmount();
  });

  it("does nothing without an element", () => {
    expect(() => {
      scrollToTop(null);
    }).not.toThrow();
  });
});
