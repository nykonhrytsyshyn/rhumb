import type { JSX } from "react";

import { useT } from "@shared/i18n";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import type { StandardOption } from "./standard-option";

export interface StandardManagerSelectProps {
  readonly id?: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly builtIn: readonly StandardOption[];
  readonly custom: readonly StandardOption[];
  /** Leave the empty "no custom standards" hint out where it makes no sense. */
  readonly hideEmptyHint?: boolean;
  readonly ariaLabel?: string;
}

export function StandardManagerSelect({
  id,
  value,
  onValueChange,
  builtIn,
  custom,
  hideEmptyHint = false,
  ariaLabel,
}: StandardManagerSelectProps): JSX.Element {
  const t = useT();
  const labelOf = (current: string | null): string | null =>
    [...builtIn, ...custom].find((option) => option.value === current)?.label ??
    current;
  const showCustomGroup = custom.length > 0 || !hideEmptyHint;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onValueChange(next);
        }
      }}
    >
      <SelectTrigger
        {...(id === undefined ? {} : { id })}
        {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
        className="w-full rounded-xl"
      >
        <SelectValue>{labelOf}</SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("editor.config.builtIn")}</SelectLabel>

          {builtIn.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>

        {showCustomGroup ? (
          <>
            <SelectSeparator />

            <SelectGroup>
              <SelectLabel>{t("editor.config.custom")}</SelectLabel>

              {custom.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t("editor.config.noCustom")}
                </p>
              ) : (
                custom.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </>
        ) : null}
      </SelectContent>
    </Select>
  );
}
