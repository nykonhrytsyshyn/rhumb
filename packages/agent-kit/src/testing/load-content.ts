import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const CONTENT_DIR = join(import.meta.dirname, "..", "..", "content");

function walk(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

export function loadContent(
  dir: string = CONTENT_DIR,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    walk(dir)
      .toSorted()
      .map((file) => [
        relative(dir, file).split(sep).join("/"),
        readFileSync(file, "utf8").replace(/\r\n/g, "\n"),
      ]),
  );
}

export interface FencedBlock {
  readonly file: string;
  readonly line: number;
  readonly tag: string;
  readonly code: string;
}

export function fencedBlocks(
  file: string,
  text: string,
  tag: string,
): readonly FencedBlock[] {
  return [
    ...text.matchAll(new RegExp(`^\`\`\`${tag}\\n([\\s\\S]*?)^\`\`\`$`, "gm")),
  ].map((match) => ({
    file,
    tag,
    code: match[1] ?? "",
    line: text.slice(0, match.index).split("\n").length + 1,
  }));
}
