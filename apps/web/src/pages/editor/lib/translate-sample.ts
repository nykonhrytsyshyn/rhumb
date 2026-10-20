import type { Language } from "@shared/i18n";

import { SAMPLES } from "../config/samples";

export function translateSample(
  source: string,
  language: Language,
): string | undefined {
  const sample = SAMPLES.find((candidate) =>
    Object.values(candidate.sources).includes(source),
  );
  const translated = sample?.sources[language];

  return translated === source ? undefined : translated;
}
