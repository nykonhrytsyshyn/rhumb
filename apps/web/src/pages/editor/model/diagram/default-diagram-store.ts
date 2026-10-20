import type { DiagramStore } from "./diagram-store";
import { IndexedDbDiagramStore } from "./indexed-db-diagram-store";

export const defaultDiagramStore: DiagramStore = new IndexedDbDiagramStore();
