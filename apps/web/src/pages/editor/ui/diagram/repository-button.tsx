import type { JSX } from "react";

import { IconBrandGithub } from "@tabler/icons-react";

import { SITE } from "@shared/config/site";
import { Button } from "@shared/ui/button";

export function RepositoryButton(): JSX.Element {
  return (
    <Button
      variant="outline"
      title={`v${SITE.version}`}
      onClick={() => {
        window.open(SITE.repositoryUrl, "_blank", "noopener,noreferrer");
      }}
      className="gap-3"
    >
      <span className="font-mono text-xs text-muted-foreground">
        v{SITE.version}
      </span>

      <IconBrandGithub />
    </Button>
  );
}
