export type SvgAttributeValue = string | number;

/** Minimal virtual SVG node, serializable without a DOM. */
export interface SvgNode {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, SvgAttributeValue>>;
  readonly children: readonly (SvgNode | string)[];
}

export function svgNode(
  tag: string,
  attrs: Readonly<Record<string, SvgAttributeValue>> = {},
  children: readonly (SvgNode | string)[] = [],
): SvgNode {
  return { tag, attrs, children };
}
