import type { JSX } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useI18n } from "@shared/i18n";

import { sourceStats } from "../../../../lib/source-stats";
import type { SavedDiagram } from "../../../../model/diagram";
import { useRenderedDiagram } from "../../../../model/diagram";
import { useProfiles } from "../../../../model/profile";

export interface LibraryUpdateComparisonProps {
  readonly saved: SavedDiagram;
  readonly source: string;
  readonly profileId: string;
  readonly standardTitle: (profileId: string) => string;
}

export function LibraryUpdateComparison({
  saved,
  source,
  profileId,
  standardTitle,
}: LibraryUpdateComparisonProps): JSX.Element {
  const { t, language } = useI18n();
  const profiles = useProfiles();
  const number = new Intl.NumberFormat(language);

  const before = useRenderedDiagram(
    saved.source,
    profiles.find((profile) => profile.id === saved.profileId) ?? profiles[0],
    0,
  );
  const after = useRenderedDiagram(
    source,
    profiles.find((profile) => profile.id === profileId) ?? profiles[0],
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <DiagramLibrary.Compare
        before={{
          label: t("editor.library.updateDialog.saved"),
          svg: before.svg,
          size: before.size,
          failed: before.error !== null,
        }}
        after={{
          label: t("editor.library.updateDialog.current"),
          svg: after.svg,
          size: after.size,
          failed: after.error !== null,
        }}
      />

      <DiagramLibrary.UpdateChanges
        changes={[
          {
            label: t("editor.library.info.standard"),
            before: standardTitle(saved.profileId),
            after: standardTitle(profileId),
          },
          {
            label: t("editor.library.updateDialog.lines"),
            before: number.format(sourceStats(saved.source).lines),
            after: number.format(sourceStats(source).lines),
          },
        ]}
      />
    </div>
  );
}
