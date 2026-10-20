export function idbCompletion(transaction: IDBTransaction): Promise<void> {
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
