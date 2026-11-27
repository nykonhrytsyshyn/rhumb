import { DEFAULT_LANGUAGE, type Language, isLanguage } from "../constants";

function segmentsOf(pathname: string): readonly string[] {
  return pathname.split("/").filter((segment) => segment !== "");
}

/** The language a URL asks for: `/uk/` is Ukrainian; `/` leaves it open. */
export function languageFromPath(pathname: string): Language | null {
  const [first] = segmentsOf(pathname);

  return first !== undefined && first !== DEFAULT_LANGUAGE && isLanguage(first)
    ? first
    : null;
}

/** The address of the editor in a language: `/` for English, `/uk/` for Ukrainian. */
export function pathForLanguage(language: Language): string {
  return language === DEFAULT_LANGUAGE ? "/" : `/${language}/`;
}

/** Whether the URL is one of the editor's own addresses, not an unknown one. */
export function isEditorPath(pathname: string): boolean {
  const segments = segmentsOf(pathname);

  return (
    segments.length === 0 ||
    (segments.length === 1 && languageFromPath(pathname) !== null)
  );
}
