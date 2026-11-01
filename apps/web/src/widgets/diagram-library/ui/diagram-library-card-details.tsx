import type { JSX } from "react";

import { IconInfoCircle } from "@tabler/icons-react";

import { useI18n } from "@shared/i18n";
import { DropdownMenuGroup, DropdownMenuLabel } from "@shared/ui/dropdown-menu";

export interface DiagramLibraryCardDetails {
  readonly standard: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly lines: number;
  readonly characters: number;
}

export interface DiagramLibraryCardInfoProps {
  readonly details: DiagramLibraryCardDetails;
}

export function DiagramLibraryCardInfo({
  details,
}: DiagramLibraryCardInfoProps): JSX.Element {
  const { t, language } = useI18n();
  const date = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const number = new Intl.NumberFormat(language);

  const rows: readonly (readonly [string, string])[] = [
    [t("editor.library.info.standard"), details.standard],
    [t("editor.library.info.created"), date.format(details.createdAt)],
    [t("editor.library.info.updated"), date.format(details.updatedAt)],
    [
      t("editor.library.info.size"),
      t("editor.library.info.sizeValue", {
        lines: number.format(details.lines),
        characters: number.format(details.characters),
      }),
    ],
  ];

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel className="flex items-center gap-1">
        <IconInfoCircle className="size-4" />
        {t("editor.library.info.title")}
      </DropdownMenuLabel>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-3 pb-3 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </DropdownMenuGroup>
  );
}
