import type { DayPickerLocale } from "react-day-picker";
import { enUS } from "react-day-picker/locale/en-US";
import { uk } from "react-day-picker/locale/uk";

import type { Language } from "@shared/i18n";

export const CALENDAR_LOCALES: Readonly<Record<Language, DayPickerLocale>> = {
  en: enUS,
  uk: uk,
};
