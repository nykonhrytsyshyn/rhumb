import { DEFAULT_LANGUAGE, type Language } from "../constants";
import {
  LOCALES_BY_LANGUAGE,
  type Messages,
  type TranslationKey,
} from "../locales";

export type InterpolationParams = Readonly<Record<string, string | number>>;

function lookup(messages: Messages, key: TranslationKey): string | undefined {
  let node: unknown = messages;

  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) {
      return undefined;
    }

    node = (node as Record<string, unknown>)[part];
  }

  return typeof node === "string" ? node : undefined;
}

function interpolate(template: string, params?: InterpolationParams): string {
  return params === undefined
    ? template
    : template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = params[name];
        return value === undefined ? match : String(value);
      });
}

/** Translates a key, falling back to the default language, then to the key. */
export function translate(
  key: TranslationKey,
  language: Language,
  params?: InterpolationParams,
): string {
  const text =
    lookup(LOCALES_BY_LANGUAGE[language], key) ??
    lookup(LOCALES_BY_LANGUAGE[DEFAULT_LANGUAGE], key) ??
    key;

  return interpolate(text, params);
}
