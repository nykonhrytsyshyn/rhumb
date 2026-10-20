import type { JSX } from "react";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

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

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`${t("common.theme.toggle")}: ${modeLabels[theme]}`}
      title={modeLabels[theme]}
      onClick={() => {
        setTheme(nextTheme(theme));
      }}
    >
      {ICONS[theme]}
    </Button>
  );
}
