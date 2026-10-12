import type { JSX } from "react";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

import { Button } from "@shared/ui/button";

import { nextTheme } from "../lib";
import { type Theme, useTheme } from "../model";

export interface ThemeTogglerProps {
  /** Accessible name of the button. */
  readonly label: string;
  /** Localised names of the modes, shown as the tooltip. */
  readonly modeLabels: Readonly<Record<Theme, string>>;
}

const ICONS: Readonly<Record<Theme, JSX.Element>> = {
  light: <IconSun />,
  dark: <IconMoon />,
  system: <IconDeviceDesktop />,
};

export function ThemeToggler({
  label,
  modeLabels,
}: ThemeTogglerProps): JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`${label}: ${modeLabels[theme]}`}
      title={modeLabels[theme]}
      onClick={() => {
        setTheme(nextTheme(theme));
      }}
    >
      {ICONS[theme]}
    </Button>
  );
}
