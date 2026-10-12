import { useCallback, useSyncExternalStore } from "react";

import type { Language } from "../constants";
import type { TranslationKey } from "../locales";
import { type InterpolationParams, languageStore, translate } from "../runtime";

export type TranslateFn = (
  key: TranslationKey,
  params?: InterpolationParams,
) => string;

export function useI18n(): {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly t: TranslateFn;
} {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
  );
  const t = useCallback<TranslateFn>(
    (key, params) => translate(key, language, params),
    [language],
  );

  return { language, setLanguage: languageStore.set, t };
}

export function useT(): TranslateFn {
  return useI18n().t;
}
