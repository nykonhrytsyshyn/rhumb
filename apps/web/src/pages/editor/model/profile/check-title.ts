export const MAX_TITLE_LENGTH = 60;

export type TitleIssue = "empty" | "tooLong" | "taken";

/**
 * Finds what is wrong with a standard's name, if anything. Names are compared
 * without regard to case or surrounding spaces, so that two standards can never
 * look the same in the list.
 */
export function checkTitle(
  title: string,
  taken: readonly string[],
): TitleIssue | undefined {
  const trimmed = title.trim();

  if (trimmed === "") {
    return "empty";
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    return "tooLong";
  }

  const key = trimmed.toLowerCase();

  return taken.some((other) => other.trim().toLowerCase() === key)
    ? "taken"
    : undefined;
}
