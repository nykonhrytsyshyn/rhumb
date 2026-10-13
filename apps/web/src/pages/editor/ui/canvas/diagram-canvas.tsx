import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  IconAlertTriangle,
  IconGridDots,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import type { RenderState } from "../../model/use-rendered-diagram";
import { CanvasToolbar } from "./canvas-toolbar";

export interface DiagramCanvasProps {
  readonly state: RenderState;
  readonly panelOpen: boolean;
  readonly onPanelOpenChange: (open: boolean) => void;
  /** Changing this value fits the next rendered diagram into the view. */
  readonly fitKey: string | number;
  /** Controls shown in the bottom-right corner. */
  readonly footer: ReactNode;
}

const FIT_MARGIN = 64;
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const SCALE_STEP = 0.002;

export function DiagramCanvas({
  state,
  panelOpen,
  onPanelOpenChange,
  fitKey,
  footer,
}: DiagramCanvasProps) {
  const t = useT();
  const root = useRef<HTMLDivElement>(null);
  const transform = useRef<ReactZoomPanPinchRef>(null);
  const pendingFit = useRef(true);
  const [grid, setGrid] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { svg, size, error, pending } = state;

  const fit = useCallback(() => {
    const api = transform.current;
    const viewport = api?.instance.wrapperComponent;

    if (
      api === null ||
      viewport === null ||
      viewport === undefined ||
      size === null
    ) {
      return;
    }

    const scale = Math.min(
      1,
      (viewport.clientWidth - FIT_MARGIN) / size.width,
      (viewport.clientHeight - FIT_MARGIN) / size.height,
    );

    void api.centerView(Math.max(scale, MIN_SCALE), 0);
  }, [size]);

  useEffect(() => {
    pendingFit.current = true;
  }, [fitKey]);

  useEffect(() => {
    if (!pendingFit.current || svg === null) {
      return;
    }

    pendingFit.current = false;
    fit();
  }, [svg, fit]);

  useEffect(() => {
    const handleChange = (): void => {
      setFullscreen(document.fullscreenElement === root.current);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const request =
      document.fullscreenElement === null
        ? root.current?.requestFullscreen()
        : document.exitFullscreen();

    request?.catch(() => undefined);
  }, []);

  return (
    <div
      ref={root}
      className={cn(
        "relative h-full min-w-0 flex-1 overflow-hidden text-foreground backdrop:bg-background",
        grid && "bg-drafting-grid",
      )}
    >
      <TransformWrapper
        ref={transform}
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
          {svg !== null && (
            <div
              role="img"
              aria-label={t("common.canvas.label")}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </TransformComponent>
      </TransformWrapper>

      {svg === null && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {error === null
            ? t("common.canvas.empty")
            : t("common.canvas.fixSource")}
        </p>
      )}

      <div className="absolute top-3 left-3 hidden md:block">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={
            panelOpen ? t("common.panel.close") : t("common.panel.open")
          }
          title={panelOpen ? t("common.panel.close") : t("common.panel.open")}
          onClick={() => {
            onPanelOpenChange(!panelOpen);
          }}
        >
          {panelOpen ? (
            <IconLayoutSidebarLeftCollapse />
          ) : (
            <IconLayoutSidebarLeftExpand />
          )}
        </Button>
      </div>

      <div className="absolute top-3 right-3">
        <CanvasToolbar
          fullscreen={fullscreen}
          onZoomIn={() => {
            void transform.current?.zoomIn();
          }}
          onZoomOut={() => {
            void transform.current?.zoomOut();
          }}
          onFit={fit}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      {error !== null && svg !== null && (
        <div
          role="status"
          className="absolute top-16 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-destructive/40 bg-background/90 px-3 py-1.5 text-xs text-destructive backdrop-blur sm:top-5"
        >
          <IconAlertTriangle className="size-4 shrink-0" />
          <span className="truncate">{t("common.canvas.fixSource")}</span>
        </div>
      )}

      <div className="absolute bottom-12 left-3 flex items-center gap-2 md:bottom-3">
        <Button
          variant={grid ? "ghost" : "outline"}
          size="icon-sm"
          aria-label={t("common.canvas.grid")}
          aria-pressed={grid}
          title={t("common.canvas.grid")}
          onClick={() => {
            setGrid((value) => !value);
          }}
        >
          <IconGridDots />
        </Button>

        <p
          aria-live="polite"
          className="font-mono text-xs text-muted-foreground"
        >
          {pending ? t("common.canvas.updating") : ""}
        </p>
      </div>

      <div className="absolute right-3 bottom-12 flex items-center gap-2 md:bottom-3">
        {footer}
      </div>
    </div>
  );
}
