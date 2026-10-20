import type { JSX } from "react";

import { IconHierarchy2 } from "@tabler/icons-react";

import { EditorPanel } from "@widgets/editor-panel";

import { useI18n } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import { SAMPLES } from "../../config/samples";

export interface SamplesSectionProps {
  readonly onSelect: (source: string) => void;
}

export function SamplesSection({ onSelect }: SamplesSectionProps): JSX.Element {
  const { t, language } = useI18n();

  return (
    <EditorPanel.Section
      icon={<IconHierarchy2 />}
      title={t("common.sections.samples")}
    >
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <Button
            key={sample.id}
            variant="outline"
            size="sm"
            onClick={() => {
              onSelect(sample.sources[language]);
            }}
          >
            {t(`editor.samples.${sample.id}`)}
          </Button>
        ))}
      </div>
    </EditorPanel.Section>
  );
}
