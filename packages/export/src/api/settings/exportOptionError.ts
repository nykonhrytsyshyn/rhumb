/** Raised when an export option has a value that cannot be used. */
export class ExportOptionError extends Error {
  public readonly field: string;

  public constructor(field: string, message: string) {
    super(`${field}: ${message}`);
    this.name = "ExportOptionError";
    this.field = field;
  }
}
