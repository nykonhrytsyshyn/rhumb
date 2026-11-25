import ELK from "elkjs/lib/elk.bundled.js";

import type { TextMeasurer } from "@rhumb/kernel";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import type { ProfileRegistry } from "@rhumb/profiles";

import { Rhumb } from "../Rhumb";
import type {
  CheckResult,
  FontSource,
  ImageOptions,
  ImageResult,
  RenderOptions,
  RenderResult,
} from "../types";
import { NodeRasterizer } from "./NodeRasterizer";
import { decodeWebFont } from "./woff";

export { type LoadFontOptions, loadFont } from "./loadFont";
export { MissingDependencyError } from "./loadOptional";
export { NodeRasterizer } from "./NodeRasterizer";
export * from "../index";

export interface NodeRhumbOptions {
  /** Profiles to offer; the built-in standards when left out. */
  readonly profiles?: ProfileRegistry;
  /** Fonts used by every drawing; see `loadFont`. */
  readonly fonts?: readonly FontSource[];
  /** Measures text for block sizes; the widths of the TTF/OTF `fonts` when left out, an estimate for the rest. */
  readonly measurer?: TextMeasurer;
}

/** A renderer for Node.js: bundled ELK layout, resvg for images. */
export function createRhumb(options: NodeRhumbOptions = {}): Rhumb {
  return new Rhumb({
    layoutEngine: new ElkLayoutEngine(new ELK()),
    createRasterizer: ({ matte, fonts }) => new NodeRasterizer(matte, fonts),
    decodeFont: decodeWebFont,
    ...(options.profiles === undefined ? {} : { profiles: options.profiles }),
    ...(options.fonts === undefined ? {} : { fonts: options.fonts }),
    ...(options.measurer === undefined ? {} : { measurer: options.measurer }),
  });
}

let shared: Rhumb | undefined;

function instance(): Rhumb {
  shared ??= createRhumb();

  return shared;
}

/** Draws a diagram as SVG with the shared renderer. */
export function render(
  source: string,
  options?: RenderOptions,
): Promise<RenderResult> {
  return instance().render(source, options);
}

/** Draws a diagram as PNG, JPEG or WebP with the shared renderer. */
export function renderImage(
  source: string,
  options?: ImageOptions,
): Promise<ImageResult> {
  return instance().renderImage(source, options);
}

/** Reads a diagram without drawing it. */
export function check(source: string): CheckResult {
  return instance().check(source);
}
