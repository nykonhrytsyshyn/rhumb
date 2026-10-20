import type { Language } from "@shared/i18n";

import { SAMPLES, type SampleId } from "../config/samples";

export function sampleSource(id: SampleId, language: Language): string {
  const sample = SAMPLES.find((candidate) => candidate.id === id);

  if (sample === undefined) {
    throw new Error(`Unknown sample "${id}"`);
  }

  return sample.sources[language];
}
