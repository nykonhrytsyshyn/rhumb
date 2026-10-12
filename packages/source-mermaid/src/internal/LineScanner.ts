import { DiagramSyntaxError } from "@rhumb/kernel";

/** Cursor over a single statement of the source text. */
export class LineScanner {
  private position = 0;

  public constructor(
    private readonly text: string,
    private readonly line: number,
  ) {}

  public get atEnd(): boolean {
    this.skipSpaces();
    return this.position >= this.text.length;
  }

  public fail(message: string): never {
    throw new DiagramSyntaxError(message, this.line);
  }

  public skipSpaces(): void {
    while (this.text.charAt(this.position) === " ") this.position += 1;
  }

  public startsWith(token: string): boolean {
    return this.text.startsWith(token, this.position);
  }

  /** Consumes the first regex match anchored at the cursor, if any. */
  public match(pattern: RegExp): RegExpExecArray | undefined {
    const sticky = new RegExp(pattern.source, `${pattern.flags}y`);
    sticky.lastIndex = this.position;
    const result = sticky.exec(this.text);

    if (result === null) {
      return undefined;
    }

    this.position += result[0].length;

    return result;
  }

  public consume(token: string): void {
    this.position += token.length;
  }

  /** Reads up to `terminator`, honouring a quoted string at the start. */
  public readUntil(terminator: string): string {
    this.skipSpaces();

    if (this.text.charAt(this.position) === '"') {
      const end = this.text.indexOf('"', this.position + 1);

      if (end === -1) {
        this.fail("Unterminated quoted text");
      }

      const quoted = this.text.slice(this.position + 1, end);
      this.position = end + 1;

      this.skipSpaces();

      if (!this.startsWith(terminator)) {
        this.fail(`Expected "${terminator}" after quoted text`);
      }

      this.consume(terminator);

      return quoted;
    }

    const end = this.text.indexOf(terminator, this.position);

    if (end === -1) {
      this.fail(`Missing closing "${terminator}"`);
    }

    const raw = this.text.slice(this.position, end);
    this.position = end + terminator.length;

    return raw.trim();
  }
}
