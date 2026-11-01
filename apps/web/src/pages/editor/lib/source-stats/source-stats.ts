export interface SourceStats {
  readonly lines: number;
  readonly characters: number;
}

export function sourceStats(source: string): SourceStats {
  return {
    lines: source.trim() === "" ? 0 : source.split(/\r\n|\r|\n/).length,
    characters: source.length,
  };
}
