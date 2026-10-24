import { DiagramSyntaxError } from "@rhumb/kernel";

import { readClosingToken, readStandaloneToken } from "./linkTokens";

const LABELLED_OPENERS = ["--", "==", "-."] as const;

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
    while (this.text.charAt(this.position) === " ") {
      this.position += 1;
    }
  }

  /** Skips spaces and the commas that separate the entries of `@{ ... }`. */
  public skipSeparators(): void {
    while (/[ ,\t]/.test(this.text.charAt(this.position)) && !this.atTextEnd) {
      this.position += 1;
    }
  }

  private get atTextEnd(): boolean {
    return this.position >= this.text.length;
  }

  /** A value in `@{ ... }`: quoted text, or bare text up to a comma or `}`. */
  public readValue(): string {
    this.skipSpaces();

    if (this.text.charAt(this.position) === '"') {
      const end = this.text.indexOf('"', this.position + 1);

      if (end === -1) {
        this.fail("Unterminated quoted text");
      }

      const quoted = this.text.slice(this.position + 1, end);

      this.position = end + 1;

      return quoted;
    }

    let end = this.position;

    while (end < this.text.length && !",}".includes(this.text.charAt(end))) {
      end += 1;
    }

    const raw = this.text.slice(this.position, end);

    this.position = end;

    return raw.trim();
  }

  /**
   * Whether `open` at the cursor is closed by `close` later in the statement.
   * For a form added on top of Mermaid the text between must also not hold
   * the bracket that ends the block, so that `A[~x] --> B[~y~]` does not read
   * `x] --> B[~y` as one label.
   */
  public closes(open: string, close: string, strict: boolean): boolean {
    let at = this.position + open.length;

    while (this.text.charAt(at) === " ") {
      at += 1;
    }

    if (this.text.charAt(at) === '"') {
      const end = this.text.indexOf('"', at + 1);

      if (end === -1) {
        return false;
      }

      at = end + 1;

      while (this.text.charAt(at) === " ") {
        at += 1;
      }

      return this.text.startsWith(close, at);
    }

    const end = this.text.indexOf(close, at);

    if (end === -1) {
      return false;
    }

    return !strict || !this.text.slice(at, end).includes(close.slice(-1));
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

  /** Consumes a standalone link token such as `-->`, `==>` or `-.->`. */
  public matchLink(): string | undefined {
    const end = readStandaloneToken(this.text, this.position);

    return end === undefined ? undefined : this.take(end);
  }

  /**
   * Consumes an opener (`--`, `==` or `-.`), a label and a closing link token,
   * where whitespace separates the label from both delimiters.
   *
   * The label ends at the first whitespace-preceded closing token. This is
   * hand-rolled rather than `opener\s+(.+?)\s+closer`: the overlapping
   * `\s+` / `.+?` / `\s+` backtracks polynomially on long runs of spaces.
   * Here every character is visited a bounded number of times, and a closing
   * token is only attempted at the start of a non-space run.
   */
  public matchLabelled():
    | {
        readonly opener: string;
        readonly label: string;
        readonly closer: string;
      }
    | undefined {
    const opener = LABELLED_OPENERS.find((token) => this.startsWith(token));

    if (opener === undefined) {
      return undefined;
    }

    const afterOpener = this.position + opener.length;

    if (!LineScanner.isSpace(this.text, afterOpener)) {
      return undefined;
    }

    let labelStart = afterOpener;

    while (LineScanner.isSpace(this.text, labelStart)) {
      labelStart += 1;
    }

    for (let at = labelStart + 1; at < this.text.length; at += 1) {
      if (
        !LineScanner.isSpace(this.text, at - 1) ||
        LineScanner.isSpace(this.text, at)
      ) {
        continue;
      }

      const end = readClosingToken(this.text, at);

      if (end !== undefined) {
        const label = this.text.slice(labelStart, at).trim();

        this.position = end;

        return { opener, label, closer: this.text.slice(at, end) };
      }
    }

    return undefined;
  }

  private take(end: number): string {
    const token = this.text.slice(this.position, end);

    this.position = end;

    return token;
  }

  private static isSpace(text: string, index: number): boolean {
    return index < text.length && /\s/.test(text.charAt(index));
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
