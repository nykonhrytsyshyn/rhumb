import { type JSX, useId } from "react";
import type { DateRange } from "react-day-picker";

import { useI18n } from "@shared/i18n";
import { Button, ButtonGroup } from "@shared/ui/button";
import { Calendar } from "@shared/ui/calendar";

import { CALENDAR_LOCALES } from "../lib/calendar-locale";
import { type DiagramLibraryFilterChoice } from "./diagram-library-filter-select";

export interface DiagramLibraryFilterDatesProps {
  readonly field: DiagramLibraryFilterChoice;
  readonly range: DateRange | undefined;
  readonly onRangeChange: (range: DateRange | undefined) => void;
}

export function DiagramLibraryFilterDates({
  field,
  range,
  onRangeChange,
}: DiagramLibraryFilterDatesProps): JSX.Element {
  const { t, language } = useI18n();
  const titleId = useId();
  const format = new Intl.DateTimeFormat(language, { dateStyle: "medium" });

  const first = range?.from ?? range?.to;
  const last = range?.to ?? range?.from;
  const summary =
    first === undefined || last === undefined
      ? t("editor.library.filter.anyDate")
      : first.getTime() === last.getTime()
        ? format.format(first)
        : t("editor.library.filter.range", {
            from: format.format(first),
            to: format.format(last),
          });

  const today = new Date();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <span
          id={titleId}
          className="text-xs leading-none font-medium uppercase"
        >
          {t("editor.library.filter.date")}
        </span>

        {range === undefined ? null : (
          <Button
            type="button"
            variant="text"
            size="xs"
            onClick={() => {
              onRangeChange(undefined);
            }}
          >
            {t("editor.library.filter.clearDates")}
          </Button>
        )}
      </div>

      <ButtonGroup
        aria-label={t("editor.library.filter.dateField")}
        className="w-full"
      >
        {field.options.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={option.value === field.value ? "secondary" : "outline"}
            aria-pressed={option.value === field.value}
            className="flex-1"
            onClick={() => {
              field.onChange(option.value);
            }}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      <p role="status" className="text-xs text-muted-foreground tabular-nums">
        {summary}
      </p>

      <Calendar
        mode="range"
        selected={range}
        onSelect={onRangeChange}
        defaultMonth={first ?? today}
        endMonth={today}
        disabled={{ after: today }}
        locale={CALENDAR_LOCALES[language]}
        fixedWeeks
        aria-labelledby={titleId}
      />
    </div>
  );
}
