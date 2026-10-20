import type { JSX } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { useT } from "@shared/i18n";

import { useRenderedDiagram } from "../../model/diagram/use-rendered-diagram";

export interface DiagramThumbnailProps {
  readonly source: string;
  readonly profile: StandardProfile | undefined;
}

/** The diagram drawn exactly as on the canvas, scaled to fit its tile. */
export function DiagramThumbnail({
  source,
  profile,
}: DiagramThumbnailProps): JSX.Element {
  const t = useT();
  const { svg, error } = useRenderedDiagram(source, profile, 0);

  if (svg === null) {
    return (
      <div className="flex size-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        {error === null ? null : (
          <span className="flex items-center gap-1">
            <IconAlertTriangle className="size-4" />
            {t("editor.library.previewFailed")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="size-full p-4 text-foreground [&>svg]:size-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
