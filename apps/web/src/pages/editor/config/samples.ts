import type { Language } from "@shared/i18n";

export type SampleId = "algorithm" | "branching" | "linear";

export interface Sample {
  readonly id: SampleId;
  readonly sources: Readonly<Record<Language, string>>;
}

export const SAMPLES: readonly Sample[] = [
  {
    id: "algorithm",
    sources: {
      en: `flowchart TD
  start(["Start"]) --> read[/"Input<br/>N (1..100)"/]
  read --> fill{{"From i = 0 to N - 1"}}
  fill --> item[/"Input<br/>a[i]"/]
  item --> fill
  fill --> init["sum = 0"]
  init --> walk{{"From p = a to a + N - 1"}}
  walk --> even{"(p - a) is even<br/>and *p is even"}
  even -->|Yes| add["sum = sum + *p"]
  even -->|No| walk
  add --> walk
  walk --> out[/"Output<br/>sum"/]
  out --> stop(["Stop"])
`,
      uk: `flowchart TD
  start(["Початок"]) --> read[/"Введення<br/>N (1..100)"/]
  read --> fill{{"Для i = 0 до N - 1"}}
  fill --> item[/"Введення<br/>a[i]"/]
  item --> fill
  fill --> init["сума = 0"]
  init --> walk{{"Для p = a до a + N - 1"}}
  walk --> even{"(p - a) парне<br/>і *p парне"}
  even -->|Так| add["сума = сума + *p"]
  even -->|Ні| walk
  add --> walk
  walk --> out[/"Виведення<br/>сума"/]
  out --> stop(["Кінець"])
`,
    },
  },
  {
    id: "branching",
    sources: {
      en: `flowchart TD
  start(["Start"]) --> read[/"Input x"/]
  read --> check{"x > 0?"}
  check -->|Yes| positive["y = x"]
  check -->|No| negative["y = -x"]
  positive --> out[/"Output y"/]
  negative --> out
  out --> stop(["Stop"])
`,
      uk: `flowchart TD
  start(["Початок"]) --> read[/"Введення x"/]
  read --> check{"x > 0?"}
  check -->|Так| positive["y = x"]
  check -->|Ні| negative["y = -x"]
  positive --> out[/"Виведення y"/]
  negative --> out
  out --> stop(["Кінець"])
`,
    },
  },
  {
    id: "linear",
    sources: {
      en: `flowchart TD
  start(["Start"]) --> read[/"Input a, b"/]
  read --> calc["c = a + b"]
  calc --> out[/"Output c"/]
  out --> stop(["Stop"])
`,
      uk: `flowchart TD
  start(["Початок"]) --> read[/"Введення a, b"/]
  read --> calc["c = a + b"]
  calc --> out[/"Виведення c"/]
  out --> stop(["Кінець"])
`,
    },
  },
];

export function sampleSource(id: SampleId, language: Language): string {
  const sample = SAMPLES.find((candidate) => candidate.id === id);

  if (sample === undefined) {
    throw new Error(`Unknown sample "${id}"`);
  }

  return sample.sources[language];
}

/**
 * When the editor still holds an untouched sample, returns the same sample in
 * another language so that the text follows the interface language.
 */
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
