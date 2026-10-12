export class DiagramSyntaxError extends Error {
  public constructor(
    message: string,
    public readonly line: number,
  ) {
    super(`Line ${String(line)}: ${message}`);
    this.name = "DiagramSyntaxError";
  }
}
