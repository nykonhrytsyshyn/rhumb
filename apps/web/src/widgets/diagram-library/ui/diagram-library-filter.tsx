import type { JSX } from "react";
import type { DateRange } from "react-day-picker";

import { IconFilter, IconRestore } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";

import { DiagramLibraryFilterDates } from "./diagram-library-filter-dates";
import {
  type DiagramLibraryFilterChoice,
  DiagramLibraryFilterSelect,
} from "./diagram-library-filter-select";

export interface DiagramLibraryFilterProps {
  readonly activeCount: number;
  readonly changed: boolean;
  readonly sort: DiagramLibraryFilterChoice;
  readonly dateField: DiagramLibraryFilterChoice;
  readonly range: DateRange | undefined;
  readonly onRangeChange: (range: DateRange | undefined) => void;
  readonly profile: DiagramLibraryFilterChoice;
  readonly pageSize: DiagramLibraryFilterChoice;
  readonly onReset: () => void;
}

export function DiagramLibraryFilter({
  activeCount,
  changed,
  sort,
  dateField,
  range,
  onRangeChange,
  profile,
  pageSize,
  onReset,
}: DiagramLibraryFilterProps): JSX.Element {
  const t = useT();
  const label =
    activeCount === 0
      ? t("editor.library.filter.open")
      : t("editor.library.filter.openActive", { count: activeCount });

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="relative h-full w-12 rounded-none border-0 border-l"
            aria-label={label}
          />
        }
      >
        <IconFilter />

        {activeCount === 0 ? null : (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] leading-none font-medium text-background"
          >
            {activeCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end">
        <DiagramLibraryFilterSelect
          label={t("editor.library.filter.sort")}
          choice={sort}
        />

        <DiagramLibraryFilterDates
          field={dateField}
          range={range}
          onRangeChange={onRangeChange}
        />

        <DiagramLibraryFilterSelect
          label={t("editor.library.filter.standard")}
          choice={profile}
        />

        <DiagramLibraryFilterSelect
          label={t("editor.library.filter.pageSize")}
          choice={pageSize}
        />

        <Button
          type="button"
          variant="outline"
          disabled={!changed}
          onClick={onReset}
        >
          <IconRestore /> {t("editor.library.filter.reset")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
