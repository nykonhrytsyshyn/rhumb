export function idbRequest<T>(pending: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    pending.onsuccess = () => {
      resolve(pending.result);
    };
    pending.onerror = () => {
      reject(pending.error ?? new Error("The browser storage request failed"));
    };
  });
}
