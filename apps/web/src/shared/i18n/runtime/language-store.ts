import {
  DEFAULT_LANGUAGE,
  type Language,
  SUPPORTED_LANGUAGES,
  isLanguage,
} from "../constants";

export const LANGUAGE_STORAGE_KEY = "language";

export function resolvePreferredLanguage(
  stored: string | null,
  preferred: readonly string[],
): Language {
  if (stored !== null && isLanguage(stored)) {
    return stored;
  }

  for (const tag of preferred) {
    const primary = tag.toLowerCase().split("-")[0] ?? "";
    const match = SUPPORTED_LANGUAGES.find((language) => language === primary);

    if (match !== undefined) {
      return match;
    }
  }

  return DEFAULT_LANGUAGE;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Observable current language, remembered between visits. */
export class LanguageStore {
  private language: Language;
  private readonly listeners = new Set<() => void>();
  private readonly storage: StorageLike;
  private readonly root: HTMLElement;

  public constructor(
    storage: StorageLike,
    preferred: readonly string[],
    root: HTMLElement,
  ) {
    this.storage = storage;
    this.root = root;
    this.language = resolvePreferredLanguage(this.read(), preferred);
    this.root.lang = this.language;
  }

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public readonly getSnapshot = (): Language => this.language;

  public readonly set = (language: Language): void => {
    if (language === this.language) {
      return;
    }

    this.language = language;
    this.root.lang = language;

    try {
      this.storage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Without storage the choice only lasts for this session
    }

    this.listeners.forEach((listener) => {
      listener();
    });
  };

  private read(): string | null {
    try {
      return this.storage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      return null;
    }
  }
}

export const languageStore = new LanguageStore(
  window.localStorage,
  window.navigator.languages,
  document.documentElement,
);
