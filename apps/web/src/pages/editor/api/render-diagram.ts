import type { RenderResult } from "@nykon/rhumb";

import type { StandardProfile } from "@rhumb/profiles";

import { rhumb } from "./rhumb";

export type Drawn = Pick<RenderResult, "size" | "svg">;

export function renderDiagram(
  source: string,
  profile: StandardProfile,
): Promise<Drawn> {
  return rhumb.render(source, {
    profile,
    ink: "currentColor",
    fill: "var(--card)",
    labelBackground: "var(--background)",
    transparent: true,
    padding: 0,
  });
}
