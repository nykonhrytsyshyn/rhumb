import { type NodeKind, type Size, type TextStyle } from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

/** A profile converted from millimetres to drawing units (pixels). */
export class Metrics {
  public readonly grid: number;
  public readonly padding: number;
  public readonly nodeSpacing: number;
  public readonly layerSpacing: number;
  public readonly lineWidth: number;
  public readonly thickWidth: number;
  public readonly dash: readonly number[];
  public readonly arrowLength: number;
  public readonly arrowWidth: number;
  public readonly arrowStyle: StandardProfile["line"]["arrow"]["style"];
  public readonly margin: number;
  public readonly textStyle: TextStyle;

  public constructor(
    private readonly profile: StandardProfile,
    private readonly scale: number,
  ) {
    this.grid = profile.grid * scale;
    this.padding = profile.padding * scale;
    this.nodeSpacing = profile.spacing.node * scale;
    this.layerSpacing = profile.spacing.layer * scale;
    this.lineWidth = profile.line.width * scale;
    this.thickWidth = profile.line.thickWidth * scale;
    this.dash = profile.line.dash.map((value) => value * scale);
    this.arrowLength = profile.line.arrow.length * scale;
    this.arrowWidth = profile.line.arrow.width * scale;
    this.arrowStyle = profile.line.arrow.style;
    this.margin = profile.grid * scale;
    this.textStyle = {
      family: profile.font.family,
      size: profile.font.size * scale,
      lineHeight: profile.font.lineHeight,
    };
  }

  public get fontFamily(): string {
    return this.profile.font.family;
  }

  /** Smallest allowed size for a block of the given kind. */
  public minimum(kind: NodeKind): Size {
    const box = this.profile.shapes[kind];

    return {
      width: box.minWidth * this.scale,
      height: box.minHeight * this.scale,
    };
  }
}
