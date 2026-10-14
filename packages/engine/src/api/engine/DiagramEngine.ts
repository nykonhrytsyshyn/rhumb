import { SvgSerializer } from "@rhumb/export";
import {
  type Appearance,
  FlowchartRenderer,
  type LabelStyle,
} from "@rhumb/flowchart";
import {
  ApproximateTextMeasurer,
  DiagramSyntaxError,
  type LayoutEngine,
  type Size,
  type TextMeasurer,
} from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

export interface EngineDependencies {
  readonly layoutEngine: LayoutEngine;
  readonly measurer?: TextMeasurer;
}

export interface EngineRenderOptions {
  readonly profile: StandardProfile;
  /** Pixels per millimetre of the profile. */
  readonly scale?: number;
  /** Colours of the drawing; unspecified parts use the print appearance. */
  readonly appearance?: Partial<Appearance>;
  /** Placement of line labels; defaults to beside the line. */
  readonly labelStyle?: LabelStyle;
}

export interface EngineResult {
  readonly svg: string;
  readonly size: Size;
}

/** Single entry point: diagram source in, standard-conforming SVG out. */
export class DiagramEngine {
  private readonly measurer: TextMeasurer;
  private readonly layoutEngine: LayoutEngine;
  private readonly parser = new FlowchartParser();
  private readonly serializer = new SvgSerializer();

  public constructor(dependencies: EngineDependencies) {
    this.measurer = dependencies.measurer ?? new ApproximateTextMeasurer();
    this.layoutEngine = dependencies.layoutEngine;
  }

  /** @throws DiagramSyntaxError when the source is not a valid diagram. */
  public async render(
    source: string,
    options: EngineRenderOptions,
  ): Promise<EngineResult> {
    DiagramEngine.assertSupported(source);

    const diagram = this.parser.parse(source);
    const renderer = new FlowchartRenderer({
      profile: options.profile,
      layoutEngine: this.layoutEngine,
      measurer: this.measurer,
      ...(options.scale === undefined ? {} : { scale: options.scale }),
      ...(options.appearance === undefined
        ? {}
        : { appearance: options.appearance }),
      ...(options.labelStyle === undefined
        ? {}
        : { labelStyle: options.labelStyle }),
    });
    const { svg, size } = await renderer.render(diagram);

    return { svg: this.serializer.serialize(svg), size };
  }

  private static assertSupported(source: string): void {
    const lines = source.split(/\r?\n/);
    const index = lines.findIndex(
      (line) => line.trim().length > 0 && !line.trim().startsWith("%%"),
    );
    const header = lines[index]?.trim() ?? "";

    if (!/^(flowchart|graph)\b/.test(header)) {
      throw new DiagramSyntaxError(
        `Diagram type "${header.split(/\s+/)[0] ?? ""}" is not supported yet`,
        index + 1,
      );
    }
  }
}
