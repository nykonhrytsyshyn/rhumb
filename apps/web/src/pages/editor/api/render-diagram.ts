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

/** Follows the page: ink takes the text colour, blocks get a solid card fill. */
export const PREVIEW_APPEARANCE: Appearance = {
  ink: "currentColor",
  fill: "var(--card)",
  background: null,
};

let engine: DiagramEngine | undefined;

/** The engine is created on first use so that its worker starts lazily. */
function getEngine(): DiagramEngine {
  engine ??= new DiagramEngine({
    layoutEngine: new ElkLayoutEngine(new ELK({ workerUrl })),
    measurer: new CanvasTextMeasurer(),
  });

  return engine;
}

export function renderDiagram(
  source: string,
  profile: StandardProfile,
  appearance: Partial<Appearance> = PREVIEW_APPEARANCE,
): Promise<EngineResult> {
  return getEngine().render(source, {
    profile,
    scale: PIXELS_PER_MM,
    appearance,
  });
}
