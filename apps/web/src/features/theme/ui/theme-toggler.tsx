import type { JSX } from "react";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

import { nextTheme } from "../lib/next-theme";
import type { Theme } from "../model/theme";
import { useTheme } from "../model/use-theme";

const ICONS: Readonly<Record<Theme, JSX.Element>> = {
  light: <IconSun />,
  dark: <IconMoon />,
  system: <IconDeviceDesktop />,
};

export function ThemeToggler(): JSX.Element {
  const t = useT();
  const { theme, setTheme } = useTheme();

  const modeLabels: Readonly<Record<Theme, string>> = {
    light: t("common.theme.mode.light"),
    dark: t("common.theme.mode.dark"),
    system: t("common.theme.mode.system"),
  };
  const label = `${t("common.theme.toggle")}: ${modeLabels[theme]}`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={label}
            onClick={() => {
              setTheme(nextTheme(theme));
            }}
            className="bg-background"
          />
        }
      >
        {ICONS[theme]}
      </TooltipTrigger>

      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
