import { type JSX, useId } from "react";

import { useT } from "@shared/i18n";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";

import type { DeveloperMode } from "../../../../model/use-developer-mode";

export interface DevModeSettingProps {
  readonly developer: DeveloperMode;
}

export function DevModeSetting({
  developer,
}: DevModeSettingProps): JSX.Element {
  const t = useT();
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Switch
          id={id}
          checked={developer.enabled}
          disabled={developer.locked}
          onCheckedChange={developer.setEnabled}
        />

        <Label htmlFor={id} className="text-sm">
          {t("editor.config.other.developer")}
        </Label>
      </div>

      <p className="text-xs text-muted-foreground">
        {developer.locked
          ? t("editor.config.other.developerLocked")
          : t("editor.config.other.developerHint")}
      </p>
    </div>
  );
}
