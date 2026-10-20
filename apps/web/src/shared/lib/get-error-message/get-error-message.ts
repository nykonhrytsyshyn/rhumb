/** The message of a thrown value, whatever it is. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
