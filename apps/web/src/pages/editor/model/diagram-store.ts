import { LABEL_STYLES, type LabelStyle } from "@rhumb/engine";

/** A diagram the user has kept, together with how it was drawn. */
export interface SavedDiagram {
  readonly id: string;
  readonly name: string;
  readonly source: string;
  readonly profileId: string;
  readonly labelStyle: LabelStyle;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface DiagramStore {
  /** All saved diagrams, the most recently changed first. */
  list(): Promise<readonly SavedDiagram[]>;
  put(diagram: SavedDiagram): Promise<void>;
  remove(id: string): Promise<void>;
}

const STORE_NAME = "diagrams";
const DATABASE_VERSION = 1;

export function isSavedDiagram(value: unknown): value is SavedDiagram {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.source === "string" &&
    typeof record.profileId === "string" &&
    LABEL_STYLES.some((style) => style === record.labelStyle) &&
    typeof record.createdAt === "number" &&
    typeof record.updatedAt === "number"
  );
}

function request<T>(pending: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    pending.onsuccess = () => {
      resolve(pending.result);
    };
    pending.onerror = () => {
      reject(pending.error ?? new Error("The browser storage request failed"));
    };
  });
}

function completion(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("The browser storage failed"));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("The browser storage was aborted"));
    };
  });
}

/**
 * Keeps diagrams in IndexedDB, which, unlike localStorage, has room for many
 * large records and can be marked as persistent so the browser keeps it.
 */
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
    const records: unknown = await request(
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
    await completion(transaction);
  }

  public async remove(id: string): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(id);
    await completion(transaction);
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

/** Asks the browser not to evict the saved diagrams when space runs low. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export const diagramStore: DiagramStore = new IndexedDbDiagramStore();
