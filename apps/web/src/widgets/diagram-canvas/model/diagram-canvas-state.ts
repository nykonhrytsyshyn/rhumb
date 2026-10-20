import type { Size } from "@rhumb/kernel";

export interface DiagramCanvasState {
  readonly svg: string | null;
  readonly size: Size | null;
  readonly error: string | null;
  readonly pending: boolean;
}
