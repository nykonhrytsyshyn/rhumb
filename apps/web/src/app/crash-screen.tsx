import type { JSX } from "react";

import { IconRefresh } from "@tabler/icons-react";

import { ErrorScreen } from "@widgets/error-screen";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

export function CrashScreen(): JSX.Element {
  const t = useT();

  return (
    <ErrorScreen code="ERR">
      <ErrorScreen.Canvas>
        <ErrorScreen.Scene />
      </ErrorScreen.Canvas>

      <ErrorScreen.Banner>
        <ErrorScreen.Title>{t("errors.crash.title")}</ErrorScreen.Title>

        <ErrorScreen.Action>
          <Button
            size="lg"
            className="h-auto gap-3 rounded-full px-8 py-6 text-base"
            onClick={() => {
              window.location.reload();
            }}
          >
            <IconRefresh className="size-6" />
            {t("errors.crash.cta")}
          </Button>
        </ErrorScreen.Action>
      </ErrorScreen.Banner>
    </ErrorScreen>
  );
}
