import type { JSX } from "react";

import { IconBrandGithub } from "@tabler/icons-react";

import { SITE } from "@shared/config/site";
import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

export function RepositoryButton(): JSX.Element {
  const t = useT();

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          onClick={() => {
            window.open(SITE.repositoryUrl, "_blank", "noopener,noreferrer");
          }}
          className="gap-3 bg-background"
        >
          <span className="font-mono text-xs text-muted-foreground">
            v{SITE.version}
          </span>

          <IconBrandGithub />
        </Button>
      </TooltipTrigger>

      <TooltipContent>{t("common.source.open")}</TooltipContent>
    </Tooltip>
  );
}
