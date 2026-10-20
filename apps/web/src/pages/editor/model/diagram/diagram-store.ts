import type { SavedDiagram } from "./is-saved-diagram";

export interface DiagramStore {
  list(): Promise<readonly SavedDiagram[]>;
  put(diagram: SavedDiagram): Promise<void>;
  remove(id: string): Promise<void>;
}
