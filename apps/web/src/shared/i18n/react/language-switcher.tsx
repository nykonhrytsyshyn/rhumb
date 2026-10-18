import type { JSX } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import {
  type Language,
  type LanguageOptionItem,
  isLanguage,
} from "../constants";

export interface LanguageSwitcherProps {
  readonly language: Language;
  readonly onChange: (language: Language) => void;
  readonly options: readonly LanguageOptionItem[];
  readonly label: string;
  readonly heading: string;
}

export function LanguageSwitcher({
  language,
  onChange,
  options,
  label,
  heading,
}: LanguageSwitcherProps): JSX.Element {
  return (
    <Select
      value={language}
      onValueChange={(value) => {
        if (typeof value === "string" && isLanguage(value)) {
          onChange(value);
        }
      }}
    >
      <SelectTrigger
        className="min-w-28 rounded-full bg-background"
        aria-label={label}
      >
        <SelectValue>
          {(value: string) =>
            options.find((option) => option.code === value)?.label ?? value
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>{heading}</SelectLabel>

          {options.map((option) => (
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
