import type { JSX } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { useT } from "@shared/i18n";

import {
  FIT_MARGIN,
  MAX_SCALE,
  MIN_SCALE,
  SCALE_STEP,
  useDiagramCanvas,
} from "../model";

export function DiagramCanvasViewport(): JSX.Element {
  const t = useT();
  const { state, transformRef } = useDiagramCanvas();

  return (
    <TransformWrapper
      ref={transformRef}
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      limitToBounds={false}
      centerOnInit
      doubleClick={{ mode: "reset" }}
      wheel={{ step: SCALE_STEP }}
    >
      <TransformComponent
        wrapperClass="cursor-grab active:cursor-grabbing !w-full !h-full"
        contentStyle={{ padding: FIT_MARGIN / 2 }}
      >
        {state.svg !== null && (
          <div
            role="img"
            aria-label={t("common.canvas.label")}
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
        )}
      </TransformComponent>
    </TransformWrapper>
  );
}
