import type { Language } from "../constants";
import enCommon from "./en/common.json";
import enDocs from "./en/docs.json";
import enEditor from "./en/editor.json";
import ukCommon from "./uk/common.json";
import ukDocs from "./uk/docs.json";
import ukEditor from "./uk/editor.json";

export interface Messages {
  readonly common: typeof enCommon;
  readonly editor: typeof enEditor;
  readonly docs: typeof enDocs;
}

type Flatten<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [Key in keyof T & string]: Flatten<
        T[Key],
        Prefix extends "" ? Key : `${Prefix}.${Key}`
      >;
    }[keyof T & string];

export type TranslationKey = Flatten<Messages>;

const en: Messages = { common: enCommon, editor: enEditor, docs: enDocs };
const uk: Messages = { common: ukCommon, editor: ukEditor, docs: ukDocs };

export const LOCALES_BY_LANGUAGE: Readonly<Record<Language, Messages>> = {
  en,
  uk,
};
