import type { JSX } from "react";

import { useT } from "@shared/i18n";
import { Label } from "@shared/ui/label";

import type { DeveloperMode } from "../../../../model/use-developer-mode";
import { AssistantSetting } from "./assistant-setting";
import { DevModeSetting } from "./dev-mode-setting";

export interface OtherSectionProps {
  readonly developer: DeveloperMode;
}

export function OtherSection({ developer }: OtherSectionProps): JSX.Element {
  const t = useT();

  return (
    <section className="flex flex-col gap-3">
      <Label className="text-xs uppercase">
        {t("editor.config.other.title")}
      </Label>

      <AssistantSetting />
      <DevModeSetting developer={developer} />
    </section>
  );
}
