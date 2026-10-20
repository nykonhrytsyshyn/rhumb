import type { StandardProfile } from "@rhumb/profiles";

import type { TranslationKey } from "@shared/i18n";

export interface FormTree {
  [key: string]: string | FormTree;
}

export type FormState = FormTree;

export type FieldErrors = ReadonlyMap<string, TranslationKey>;

export interface ParsedForm {
  readonly profile: StandardProfile | undefined;
  readonly errors: FieldErrors;
  readonly general: readonly TranslationKey[];
}
