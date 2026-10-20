import ELK from "elkjs/lib/elk-api";
import workerUrl from "elkjs/lib/elk-worker.min.js?url";

import {
  type Appearance,
  DiagramEngine,
  type EngineResult,
} from "@rhumb/engine";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import type { StandardProfile } from "@rhumb/profiles";

import { CanvasTextMeasurer } from "../lib/canvas-text-measurer";

const PIXELS_PER_MM = 4;

export const PREVIEW_APPEARANCE: Appearance = {
  ink: "currentColor",
  fill: "var(--card)",
  background: null,
  labelBackground: "var(--background)",
};

let engine: DiagramEngine | undefined;

function getEngine(): DiagramEngine {
  engine ??= new DiagramEngine({
    layoutEngine: new ElkLayoutEngine(new ELK({ workerUrl })),
    measurer: new CanvasTextMeasurer(),
  });

  return engine;
}

export interface RenderOptions {
  readonly appearance?: Partial<Appearance>;
}

export function renderDiagram(
  source: string,
  profile: StandardProfile,
  options: RenderOptions = {},
): Promise<EngineResult> {
  return getEngine().render(source, {
    profile,
    scale: PIXELS_PER_MM,
    appearance: options.appearance ?? PREVIEW_APPEARANCE,
  });
}
