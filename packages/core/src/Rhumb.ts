import { DiagramEngine } from "@rhumb/engine";
import {
  RASTER_MIME_TYPES,
  RasterExporter,
  type Rasterizer,
  SvgFontEmbedder,
  SvgFrame,
  exceedsRasterLimit,
  rasterMatte,
  resolveExportSettings,
  toAppearance,
  toFrameOptions,
} from "@rhumb/export";
import {
  DiagramSyntaxError,
  type LayoutEngine,
  type TextMeasurer,
} from "@rhumb/kernel";
import { ProfileRegistry, type StandardProfile } from "@rhumb/profiles";

import { type ResolvedFont, fontsForProfile, toEmbeddedFont } from "./fonts";
import { FontMetricsMeasurer } from "./metrics/FontMetricsMeasurer";
import type {
  CheckResult,
  FontSource,
  ImageOptions,
  ImageResult,
  RenderOptions,
  RenderResult,
} from "./types";

const DEFAULT_PIXELS_PER_MM = 4;
const DEFAULT_SCALE = 2;
const LINE_PREFIX = /^Line \d+: /;

/** What an image is drawn with, handed to the rasterizer's factory. */
export interface RasterizerContext {
  /** Colour painted under the drawing, or null to keep transparency. */
  readonly matte: string | null;
  /** The fonts the drawing's text uses; the ones the profile names. */
  readonly fonts: readonly ResolvedFont[];
}

export interface RhumbDependencies {
  readonly layoutEngine: LayoutEngine;
  /**
   * Measures text for block sizes. When left out, the text is measured with
   * the widths of the TTF and OTF files given as `fonts`, and estimated for
   * any family without one.
   */
  readonly measurer?: TextMeasurer;
  /** Profiles to offer; the built-in standards when left out. */
  readonly profiles?: ProfileRegistry;
  /** Fonts used by every drawing, besides the ones a call brings. */
  readonly fonts?: readonly FontSource[];
  /** Runs before a drawing is measured, e.g. to wait for a web font. */
  readonly prepare?: (profile: StandardProfile) => Promise<void>;
  /** Reads a WOFF or WOFF2 file for measuring text; without it only TTF and OTF are measured. */
  readonly decodeFont?: (font: ResolvedFont) => Uint8Array | undefined;
  /** Makes the rasterizer that encodes images; without it only SVG works. */
  readonly createRasterizer?: (context: RasterizerContext) => Rasterizer;
}

interface Drawing extends RenderResult {
  readonly fonts: readonly ResolvedFont[];
}

/** Diagram source in; standard-conforming SVG and images out. */
export class Rhumb {
  private readonly engine: DiagramEngine;
  private readonly layoutEngine: LayoutEngine;
  private readonly measurer: TextMeasurer | undefined;
  private readonly registry: ProfileRegistry;
  private readonly fonts: readonly FontSource[];
  private readonly prepare:
    ((profile: StandardProfile) => Promise<void>) | undefined;
  private readonly decodeFont:
    ((font: ResolvedFont) => Uint8Array | undefined) | undefined;
  private readonly createRasterizer:
    ((context: RasterizerContext) => Rasterizer) | undefined;

  public constructor(dependencies: RhumbDependencies) {
    this.layoutEngine = dependencies.layoutEngine;
    this.measurer = dependencies.measurer;
    this.engine = new DiagramEngine({
      layoutEngine: dependencies.layoutEngine,
      ...(dependencies.measurer === undefined
        ? {}
        : { measurer: dependencies.measurer }),
    });
    this.registry = dependencies.profiles ?? ProfileRegistry.withBuiltins();
    this.fonts = dependencies.fonts ?? [];
    this.prepare = dependencies.prepare;
    this.createRasterizer = dependencies.createRasterizer;
    this.decodeFont = dependencies.decodeFont;
  }

  public profiles(): readonly StandardProfile[] {
    return this.registry.list();
  }

  /** @throws Error when no profile is registered under the id. */
  public profile(id: string): StandardProfile {
    return this.registry.get(id);
  }

  /**
   * Adds a profile, such as one loaded from a JSON file.
   *
   * @throws InvalidProfileError when it does not match the schema.
   */
  public registerProfile(raw: unknown): StandardProfile {
    return this.registry.register(raw);
  }

  /**
   * Draws a diagram as SVG.
   *
   * @throws DiagramSyntaxError when the source is not a valid diagram.
   * @throws ExportOptionError when an option has an unusable value.
   */
  public async render(
    source: string,
    options: RenderOptions = {},
  ): Promise<RenderResult> {
    const { svg, size, profile } = await this.draw(source, options);

    return { svg, size, profile };
  }

  /**
   * Draws a diagram as a PNG, JPEG or WebP image.
   *
   * @throws Error when this instance has no rasterizer, or the image is too
   *               large for one to draw.
   */
  public async renderImage(
    source: string,
    options: ImageOptions = {},
  ): Promise<ImageResult> {
    if (this.createRasterizer === undefined) {
      throw new Error(
        "Images need a rasterizer: use @nykon/rhumb/node or @nykon/rhumb",
      );
    }

    const format = options.format ?? "png";
    const settings = resolveExportSettings({
      ...options,
      format,
      scale: options.scale ?? DEFAULT_SCALE,
    });
    const { svg, size, fonts } = await this.draw(source, options);

    if (exceedsRasterLimit(size, { ...settings, padding: 0 })) {
      throw new RangeError(
        "The image is too large to draw; lower the scale or the padding",
      );
    }

    const blob = await new RasterExporter(
      this.createRasterizer({ matte: rasterMatte(format, settings), fonts }),
    ).export(svg, size, settings.scale, {
      format,
      quality: settings.quality / 100,
    });

    return {
      blob,
      format,
      mime: RASTER_MIME_TYPES[format],
      width: Math.round(size.width * settings.scale),
      height: Math.round(size.height * settings.scale),
      bytes: async () => new Uint8Array(await blob.arrayBuffer()),
    };
  }

  /** Reads a diagram without drawing it; a syntax problem is a result. */
  public check(source: string): CheckResult {
    try {
      const diagram = this.engine.parse(source);

      return {
        ok: true,
        nodes: diagram.nodes.length,
        edges: diagram.edges.length,
      };
    } catch (error) {
      if (error instanceof DiagramSyntaxError) {
        return {
          ok: false,
          line: error.line,
          message: error.message.replace(LINE_PREFIX, ""),
        };
      }

      throw error;
    }
  }

  private async draw(source: string, options: RenderOptions): Promise<Drawing> {
    const profile = this.resolveProfile(options.profile);
    const settings = resolveExportSettings(options);
    const fonts = fontsForProfile(
      [...(options.fonts ?? []), ...this.fonts],
      profile,
    );
    const appearance = {
      ...toAppearance(settings),
      ...(options.labelBackground === undefined
        ? {}
        : { labelBackground: options.labelBackground }),
    };

    await this.prepare?.(profile);

    const drawn = await this.engineFor(fonts).render(source, {
      profile,
      scale: options.pixelsPerMm ?? DEFAULT_PIXELS_PER_MM,
      appearance,
    });
    const framed = new SvgFrame().wrap(
      drawn.svg,
      drawn.size,
      toFrameOptions(settings),
    );

    return {
      svg: new SvgFontEmbedder().embed(framed.svg, fonts.map(toEmbeddedFont)),
      size: framed.size,
      profile,
      fonts,
    };
  }

  /** The engine whose measurer knows the fonts of this drawing. */
  private engineFor(fonts: readonly ResolvedFont[]): DiagramEngine {
    return this.measurer === undefined
      ? new DiagramEngine({
          layoutEngine: this.layoutEngine,
          measurer: new FontMetricsMeasurer(fonts, this.decodeFont),
        })
      : this.engine;
  }

  private resolveProfile(
    profile: string | StandardProfile | undefined,
  ): StandardProfile {
    if (typeof profile === "object") {
      return profile;
    }

    return typeof profile === "string"
      ? this.registry.get(profile)
      : this.registry.default();
  }
}
