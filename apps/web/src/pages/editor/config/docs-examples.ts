import type { Language } from "@shared/i18n";

interface Words {
  readonly start: string;
  readonly end: string;
  readonly yes: string;
  readonly no: string;
  readonly input: string;
  readonly output: string;
  readonly keyboard: string;
  readonly orders: string;
  readonly reports: string;
  readonly step: string;
  readonly part: string;
  readonly ok: string;
  readonly fix: string;
  readonly note: string;
}

const WORDS: Readonly<Record<Language, Words>> = {
  en: {
    start: "Start",
    end: "End",
    yes: "Yes",
    no: "No",
    input: "Input",
    output: "Output",
    keyboard: "Keyboard",
    orders: "Orders",
    reports: "Reports",
    step: "Step",
    part: "Check",
    ok: "Valid",
    fix: "Correct",
    note: "Runs once",
  },
  uk: {
    start: "Початок",
    end: "Кінець",
    yes: "Так",
    no: "Ні",
    input: "Введення",
    output: "Виведення",
    keyboard: "Клавіатура",
    orders: "Замовлення",
    reports: "Звіти",
    step: "Крок",
    part: "Перевірка",
    ok: "Коректно",
    fix: "Виправлення",
    note: "Виконується раз",
  },
};

function example(
  build: (words: Words) => string,
): Readonly<Record<Language, string>> {
  return { en: build(WORDS.en), uk: build(WORDS.uk) };
}

export const DOCS_EXAMPLES = {
  start: example(
    (w) => `flowchart TD
  start(["${w.start}"]) --> read[/"${w.input} N"/]
  read --> check{"N > 0?"}
  check -->|${w.yes}| calc["S = N * 2"]
  check -->|${w.no}| stop(["${w.end}"])
  calc --> out[/"${w.output} S"/]
  out --> stop`,
  ),

  quotes: example(
    (w) => `flowchart TD
  a[/"${w.input}<br/>a[i]"/] --> b["x; y %% z"]
  b --> c{"a < b?"}`,
  ),

  byName: example(
    (w) => `flowchart TD
  keys@{ shape: manual-input, label: "${w.keyboard}", ident: "I1" } --> store@{ shape: db, label: "${w.orders}" }
  store --> report@{ shape: docs, label: "${w.reports}", desc: "A4" }`,
  ),

  loop: example(
    (w) => `flowchart TD
  start(["${w.start}"]) --> read[/"${w.input} N"/]
  read --> fill{{"i = 0 .. N - 1"}}
  fill --> item[/"${w.input} a[i]"/]
  item --> fill
  fill --> out[/"${w.output} a"/]
  out --> stop(["${w.end}"])`,
  ),

  limits: example(
    () => `flowchart TD
  outer{^"i: i = 1..N"^} --> inner{^"j: j = 1..i"^}
  inner --> act["a[i][j] = i * j"]
  act --> innerEnd{_"j"_}
  innerEnd --> outerEnd{_"i"_}`,
  ),

  frames: example(
    (w) => `flowchart TD
  a["${w.step} 1"] --> check
  subgraph part ["${w.part}"]
    check{"${w.ok}?"} -->|${w.no}| fix["${w.fix}"]
    fix --> check
  end
  check -->|${w.yes}| done(["${w.end}"])
  note[*"${w.note}"*] -.- part`,
  ),

  parallel: example(
    (w) => `flowchart TD
  go(["${w.start}"]) --> fork[=]
  fork --> b["${w.step} 1"]
  fork --> c["${w.step} 2"]
  b --> join[=]
  c --> join
  join --> done(["${w.end}"])`,
  ),

  sheets: example(
    (w) => `flowchart TD
  a["${w.step} 1"] --> out1(("A"))
  in1(("A")) --> b["${w.step} 2"]`,
  ),
} as const;

export type DocsExampleId = keyof typeof DOCS_EXAMPLES;
