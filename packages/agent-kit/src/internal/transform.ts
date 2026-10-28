const PROMPT_ONLY =
  /^[ \t]*<!-- prompt-only -->[ \t]*\n[\s\S]*?^[ \t]*<!-- \/prompt-only -->[ \t]*\n?/gm;
const SKILL_ONLY =
  /^[ \t]*<!-- skill-only -->[ \t]*\n[\s\S]*?^[ \t]*<!-- \/skill-only -->[ \t]*\n?/gm;
const MARKER_LINE = /^[ \t]*<!-- \/?(?:prompt-only|skill-only) -->[ \t]*\n?/gm;
const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/;
const REFERENCE_LINK = /\[([^\]]+)\]\(references\/[^)]+\)/g;

/**
 * Puts the values in place of `{{name}}`. Only the names given are touched,
 * because the text also holds Mermaid's own `{{text}}` form.
 */
export function fill(
  text: string,
  values: Readonly<Record<string, string>>,
): string {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (whole, name: string) => values[name] ?? whole,
  );
}

/**
 * Text for a skill folder: what is meant for prompts only is dropped, and
 * the markers of what stays are removed.
 */
export function forSkill(text: string): string {
  return text.replace(PROMPT_ONLY, "").replace(MARKER_LINE, "");
}

/**
 * Text for a single-file prompt: what is meant for skills only is dropped,
 * the front matter goes, and links to files of the skill become mentions of
 * a section of the same text.
 */
export function forPrompt(text: string): string {
  return text
    .replace(SKILL_ONLY, "")
    .replace(MARKER_LINE, "")
    .replace(FRONTMATTER, "")
    .replace(REFERENCE_LINK, (_whole, label: string) => `“${label}” below`);
}

/** The text without its front matter. */
export function stripFrontmatter(text: string): string {
  return text.replace(FRONTMATTER, "");
}

/** Counts of marker lines, for tests that check they are paired. */
export function markerBalance(text: string): Readonly<Record<string, number>> {
  const count = (pattern: RegExp): number => text.match(pattern)?.length ?? 0;

  return {
    promptOpen: count(/<!-- prompt-only -->/g),
    promptClose: count(/<!-- \/prompt-only -->/g),
    skillOpen: count(/<!-- skill-only -->/g),
    skillClose: count(/<!-- \/skill-only -->/g),
  };
}
