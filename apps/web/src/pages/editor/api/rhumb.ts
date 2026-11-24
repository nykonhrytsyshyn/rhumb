import { ElkLayoutEngine, Rhumb } from "@nykon/rhumb";
import ELK from "elkjs/lib/elk-api";
import workerUrl from "elkjs/lib/elk-worker.min.js?url";

import { CanvasRasterizer } from "../lib/canvas-rasterizer";
import { CanvasTextMeasurer } from "../lib/canvas-text-measurer";
import { loadProfileFont } from "../lib/load-profile-font";

export const rhumb = new Rhumb({
  layoutEngine: new ElkLayoutEngine(new ELK({ workerUrl })),
  measurer: new CanvasTextMeasurer(),
  prepare: loadProfileFont,
  createRasterizer: ({ matte }) => new CanvasRasterizer(matte),
});
