import { type JSX, useId } from "react";

import { useT } from "@shared/i18n";
import { Badge } from "@shared/ui/badge";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";

import type { DeveloperMode } from "../../../model/use-developer-mode";

export interface OtherSectionProps {
  readonly developer: DeveloperMode;
}

export function OtherSection({ developer }: OtherSectionProps): JSX.Element {
  const t = useT();
  const developerId = useId();
  const assistantId = useId();

  return (
    <section className="flex flex-col gap-3">
      <Label className="text-xs uppercase">
        {t("editor.config.other.title")}
      </Label>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Switch
            id={developerId}
            checked={developer.enabled}
            disabled={developer.locked}
            onCheckedChange={developer.setEnabled}
          />

          <Label htmlFor={developerId} className="text-sm">
            {t("editor.config.other.developer")}
          </Label>
        </div>

        <p className="text-xs text-muted-foreground">
          {developer.locked
            ? t("editor.config.other.developerLocked")
            : t("editor.config.other.developerHint")}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Switch id={assistantId} checked={false} disabled />

          <Label htmlFor={assistantId} className="text-sm">
            {t("editor.config.other.assistant")}
          </Label>

          <Badge variant="outline">{t("editor.config.other.soon")}</Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("editor.config.other.assistantHint")}
        </p>
      </div>
    </section>
  );
}
