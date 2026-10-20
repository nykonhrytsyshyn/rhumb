import type { JSX } from "react";

import { IconArrowUpRight } from "@tabler/icons-react";

import { ErrorScreen } from "@widgets/error-screen";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import { useNotFoundMeta } from "../model/use-not-found-meta";

const NOT_FOUND_CODE = "404";

export function NotFoundPage(): JSX.Element {
  const t = useT();
  const title = t("errors.notFound.title");

  useNotFoundMeta(`${NOT_FOUND_CODE} ${title} · ${t("common.app.name")}`);

  return (
    <ErrorScreen code={NOT_FOUND_CODE}>
      <ErrorScreen.Canvas>
        <ErrorScreen.Scene />
      </ErrorScreen.Canvas>

      <ErrorScreen.Banner>
        <ErrorScreen.Title>{title}</ErrorScreen.Title>

        <ErrorScreen.Action>
          <Button
            size="lg"
            nativeButton={false}
            render={<a href="/" />}
            className="group h-auto gap-3 rounded-full px-8 py-6 text-base"
          >
            <IconArrowUpRight className="size-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            {t("errors.notFound.cta")}
          </Button>
        </ErrorScreen.Action>
      </ErrorScreen.Banner>
    </ErrorScreen>
  );
}
