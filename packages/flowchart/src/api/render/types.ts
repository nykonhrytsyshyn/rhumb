import type { Size, SvgNode } from "@rhumb/kernel";

export interface RenderedDiagram {
  readonly svg: SvgNode;
  /** Size of the whole drawing, margins included. */
  readonly size: Size;
}

export interface Appearance {
  /** Colour of lines and text; "currentColor" follows the surrounding CSS. */
  readonly ink: string;
  /** Fill of blocks, or "none" for see-through blocks. */
  readonly fill: string;
  /** Page colour, or null for a transparent drawing. */
  readonly background: string | null;
}

/** Black on white, suitable for documents and printing. */
export const PRINT_APPEARANCE: Appearance = {
  ink: "#000000",
  fill: "#ffffff",
  background: "#ffffff",
};
