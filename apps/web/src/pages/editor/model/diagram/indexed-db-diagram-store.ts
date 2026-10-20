import type { DiagramStore } from "./diagram-store";
import { idbCompletion } from "./idb-completion";
import { idbRequest } from "./idb-request";
import { isSavedDiagram } from "./is-saved-diagram";
import type { SavedDiagram } from "./is-saved-diagram";

const STORE_NAME = "diagrams";
const DATABASE_VERSION = 1;

export class IndexedDbDiagramStore implements DiagramStore {
  private readonly factory: IDBFactory | undefined;
  private readonly name: string;
  private connection: Promise<IDBDatabase> | undefined;

  public constructor(
    factory: IDBFactory | undefined = typeof indexedDB === "undefined"
      ? undefined
      : indexedDB,
    name = "rhumb",
  ) {
    this.factory = factory;
    this.name = name;
  }

  public async list(): Promise<readonly SavedDiagram[]> {
    const database = await this.open();
    const records: unknown = await idbRequest(
      database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll(),
    );

    return (Array.isArray(records) ? records : [])
      .filter(isSavedDiagram)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public async put(diagram: SavedDiagram): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(diagram);
    await idbCompletion(transaction);
  }

  public async remove(id: string): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(id);
    await idbCompletion(transaction);
  }

  private open(): Promise<IDBDatabase> {
    this.connection ??= new Promise((resolve, reject) => {
      if (this.factory === undefined) {
        reject(new Error("Browser storage is not available"));

        return;
      }

      const opening = this.factory.open(this.name, DATABASE_VERSION);

      opening.onupgradeneeded = () => {
        opening.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      opening.onsuccess = () => {
        resolve(opening.result);
      };
      opening.onerror = () => {
        reject(opening.error ?? new Error("The browser storage did not open"));
      };
    });

    return this.connection;
  }
}
