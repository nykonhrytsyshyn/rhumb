import { type JSX, useId } from "react";

import { useT } from "@shared/i18n";
import { Badge } from "@shared/ui/badge";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";

export function AssistantSetting(): JSX.Element {
  const t = useT();
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Switch id={id} checked={false} disabled />

        <Label htmlFor={id} className="text-sm">
          {t("editor.config.other.assistant")}
        </Label>

        <Badge variant="outline">{t("editor.config.other.soon")}</Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("editor.config.other.assistantHint")}
      </p>
    </div>
  );
}
