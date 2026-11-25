export interface Io {
  readonly readStdin: () => Promise<Uint8Array>;
  readonly stdinIsTty: boolean;
  readonly stdoutIsTty: boolean;
  readonly writeStdout: (data: string | Uint8Array) => void;
  readonly writeStderr: (text: string) => void;
}

export interface Environment {
  readonly io: Io;
  readonly version: string;
  readonly agentSources: () => Readonly<Record<string, string>>;
}

export class UsageError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

export const EXIT_OK = 0;
export const EXIT_FAILED = 1;
export const EXIT_USAGE = 2;
