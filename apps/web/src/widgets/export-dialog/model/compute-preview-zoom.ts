import type { Size } from "@rhumb/kernel";

import {
  MAX_ENLARGEMENT,
  MAX_NATURAL_ZOOM,
  MIN_FIT_SCALE,
  MIN_RELATIVE_ZOOM,
  PREVIEW_MARGIN,
} from "./constants";

export interface PreviewZoom {
  readonly fitScale: number;
  readonly maxScale: number;
}

export function computePreviewZoom(
  page: Size | null,
  viewport: Size | null,
): PreviewZoom {
  if (
    page === null ||
    viewport === null ||
    page.width <= 0 ||
    page.height <= 0 ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return { fitScale: 1, maxScale: MAX_NATURAL_ZOOM };
  }

  const availableWidth = Math.max(1, viewport.width - PREVIEW_MARGIN * 2);
  const availableHeight = Math.max(1, viewport.height - PREVIEW_MARGIN * 2);
  const fitScale = Math.max(
    MIN_FIT_SCALE,
    Math.min(
      MAX_ENLARGEMENT,
      availableWidth / page.width,
      availableHeight / page.height,
    ),
  );

  return {
    fitScale,
    maxScale: Math.max(MAX_NATURAL_ZOOM, fitScale * MIN_RELATIVE_ZOOM),
  };
}
