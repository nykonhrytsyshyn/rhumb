export const DEFAULT_LANGUAGE = "en" as const;
export const SUPPORTED_LANGUAGES = [DEFAULT_LANGUAGE, "uk"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageOptionItem {
  readonly code: Language;
  readonly label: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOptionItem[] = [
  { code: "en", label: "English" },
  { code: "uk", label: "Українська" },
];

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
