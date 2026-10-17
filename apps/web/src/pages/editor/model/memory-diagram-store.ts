import type { DiagramStore, SavedDiagram } from "./diagram-store";

/** A store that keeps diagrams in memory; used where IndexedDB is not wanted. */
export class MemoryDiagramStore implements DiagramStore {
  private readonly records = new Map<string, SavedDiagram>();
  private readonly failure: Error | undefined;

  public constructor(initial: readonly SavedDiagram[] = [], failure?: Error) {
    this.failure = failure;

    for (const diagram of initial) {
      this.records.set(diagram.id, diagram);
    }
  }

  public list(): Promise<readonly SavedDiagram[]> {
    return this.failure === undefined
      ? Promise.resolve(
          [...this.records.values()].sort((a, b) => b.updatedAt - a.updatedAt),
        )
      : Promise.reject(this.failure);
  }

  public put(diagram: SavedDiagram): Promise<void> {
    if (this.failure !== undefined) {
      return Promise.reject(this.failure);
    }

    this.records.set(diagram.id, diagram);

    return Promise.resolve();
  }

  public remove(id: string): Promise<void> {
    if (this.failure !== undefined) {
      return Promise.reject(this.failure);
    }

    this.records.delete(id);

    return Promise.resolve();
  }
}
