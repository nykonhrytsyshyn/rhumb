import type { JSX } from "react";

import {
  LANGUAGE_OPTIONS,
  type Language,
  isLanguage,
  useI18n,
} from "@shared/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

export interface LanguageSwitcherProps {
  readonly onChange?: (language: Language) => void;
}

export function LanguageSwitcher({
  onChange,
}: LanguageSwitcherProps): JSX.Element {
  const { t, language, setLanguage } = useI18n();

  return (
    <Select
      value={language}
      onValueChange={(value) => {
        if (typeof value === "string" && isLanguage(value)) {
          onChange?.(value);
          setLanguage(value);
        }
      }}
    >
      <SelectTrigger
        className="min-w-28 rounded-full bg-background"
        aria-label={t("common.language.label")}
      >
        <SelectValue>
          {(value: string) =>
            LANGUAGE_OPTIONS.find((option) => option.code === value)?.label ??
            value
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>{t("common.language.heading")}</SelectLabel>

          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem
              key={option.code}
              value={option.code}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
