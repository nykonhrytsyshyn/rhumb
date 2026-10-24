import type { Language } from "@shared/i18n";

import { WORDS, type Words } from "./dev-words";

export interface DevSample<Id extends string = string> {
  readonly id: Id;
  readonly sources: Readonly<Record<Language, string>>;
}

function sample<const Id extends string>(
  id: Id,
  build: (w: Words) => string,
): DevSample<Id> {
  return {
    id,
    sources: { en: build(WORDS.en), uk: build(WORDS.uk) },
  };
}

export const DEV_SAMPLES = [
  sample(
    "everyBlock",
    (w) => `flowchart TD
  start(["${w.start}"]) --> stored[)"Stored data"(]
  stored --> memory[#"Internal memory"#]
  memory --> tape(@"Sequential access"@)
  tape --> disk[("Direct access")]
  disk --> doc[~"Document"~]
  doc --> paper[~~"Paper tape"~~]
  paper --> manual[^"Manual input"^]
  manual --> card[:"Card":]
  card --> display(="Display"=)
  display --> hand[\\"Manual operation"/]
  hand --> split[=]
  split --> loop{^"i: i = 1..n"^}
  loop --> proc[["Predefined process"]]
  proc --> prep{{"Preparation"}}
  prep --> io[/"${w.input} / ${w.output}"/]
  io --> pick{"Decision?"}
  pick -->|${w.yes}| next
  pick -->|${w.no}| next
  next["Process"] --> back{_"i"_}
  back --> link
  link(>"P">) -->|~| conn(("A"))
  conn --> stop(["${w.end}"])
`,
  ),
  sample(
    "dataFlow",
    (w) => `flowchart TD
  cheques@{ shape: docs, label: "${w.cheques}", ident: "D1" } --> check[\\"${w.checkDetails}"/]
  check --> keyIn[^"${w.keyIn}"^]
  keyIn --> reg[["${w.register}"]]
  reg --> master[("${w.masterFile}")]
  reg --> receipts[~"${w.receipts}"~]
  master --> sort[\\"${w.sortBlank}"/]
  sort --> list@{ shape: docs, label: "${w.blankList}" }
  sort --> archive(@"${w.tape}"@)
  receipts -.-> note[*"${w.note}"*]
  archive --> forms@{ shape: doc, label: "${w.forms}", desc: "A4" }
`,
  ),
  sample(
    "systemFlow",
    (w) => `flowchart TD
  start(["${w.order}"]) --> init["${w.displayData}"]
  show(="${w.screen}"=) --- init
  init --> check["${w.validate}"]
  asks[^"${w.keyboard}: ${w.customerFile}, ${w.stockFile}"^] --> check
  customers[("${w.customerFile}")] --> check
  stock[("${w.stockFile}")] --> check
  check --> temp(@"${w.tempFile}"@)
  temp --> kind{"${w.isOrder}"}
  kind -->|${w.query}| finish(["${w.end}"])
  kind -->|${w.order}| handle["${w.processOrder}"]
  handle --> stock
  handle --> accepted[("${w.orderFile}")]
  accepted --> bills["${w.makeInvoices}"]
  bills --> invoices[~"${w.invoices}"~]
  invoices --> finish
`,
  ),
  sample(
    "loops",
    (w) => `flowchart TD
  start(["${w.start}"]) --> read[/"${w.input} N"/]
  read --> outer{^"i: i = 1..N"^}
  outer --> inner{^"j: j = 1..i"^}
  inner --> act["a[i][j] = i * j"]
  act --> innerEnd{_"j"_}
  innerEnd --> sum["s = s + i"]
  sum --> outerEnd{_"i"_}
  outerEnd --> show[/"${w.output} s"/]
  show --> second{^"k: s > 0"^}
  second -->|...| secondEnd{_"k"_}
  secondEnd --> stop(["${w.end}"])
`,
  ),
  sample(
    "parallel",
    (w) => `flowchart TD
  go(["${w.start}"]) --> a["A"]
  a --> fork[=]
  fork --> b["B"]
  fork --> c["C"]
  fork --> d["D"]
  fork --> e["E"]
  b --> join[=]
  c --> join
  d --> join
  join --> f["F"]
  e --> done(["${w.end}"])
  f --> done
`,
  ),
  sample(
    "frames",
    (w) => `flowchart TD
  a[/"${w.input} A"/] -.- n1[*"${w.note}"*]
  a --> one
  subgraph part [" "]
    one["${w.processOrder} 1"] --> b[/"${w.input} B"/]
    b --> two["${w.processOrder} 2"]
  end
  n2[*"${w.noteDetail}"*] -.- part
  two --> done(["${w.end}"])
`,
  ),
  sample(
    "nestedFrames",
    (w) => `flowchart TD
  start(["${w.start}"]) --> load
  subgraph whole ["${w.whole}"]
    load["${w.loadList}"]
    subgraph partial ["${w.part}"]
      check{"${w.ok}?"} -->|${w.yes}| total["${w.total}"]
      check -->|${w.no}| fix["${w.retry}"]
      fix --> check
    end
    load --> check
    total --> save[("${w.masterFile}")]
  end
  save --> stop(["${w.end}"])
  n[*"${w.note}"*] -.- partial
`,
  ),
  sample(
    "comments",
    (w) => `flowchart TD
  start(["${w.start}"]) --> read[/"${w.input} x"/]
  read --> check{"x > 0?"}
  check -->|${w.yes}| p["y = x"]
  check -->|${w.no}| q["y = -x"]
  p --> out
  q --> out[/"${w.output} y"/]
  out --> goOn(("L1"))
  goOn --> stop(["${w.end}"])
  c1[*"${w.note}"*] -.- start
  c2[*"${w.noteDetail}"*] -.- check
  c3[*"${w.toPage}"*] -.- goOn
  c4[*"${w.fromPage}"*] -.- read
  c5[*"${w.stage} 2"*] -.- out
`,
  ),
  sample(
    "stripe",
    (w) => `flowchart TD
  start(["${w.start}"]) --> prep@{ ref: "X84", label: "${w.detail}" }
  prep --> doc@{ shape: doc, label: "${w.reports}", ref: "D12" }
  doc --> pick@{ shape: diam, label: "${w.ok}?", ref: "Q1" }
  pick -->|${w.yes}| stop(["${w.end}"])
  pick -->|${w.no}| prep
  detailTop(["X84 ${w.detailBegin}"]) --> inner["${w.step} 1"]
  inner --> innerTwo["${w.step} 2"]
  innerTwo --> detailEnd(["X84 ${w.detailEnd}"])
`,
  ),
  sample(
    "stacked",
    (w) => `flowchart TD
  start(["${w.start}"]) --> forms@{ shape: docs, label: "${w.forms}" }
  forms --> west@{ shape: doc, label: "${w.reportWest}", stack: 2 }
  forms --> east@{ shape: doc, label: "${w.reportEast}", stack: 4 }
  west --> work@{ shape: st-rect, label: "${w.processOrder}" }
  east --> work
  work --> cards@{ shape: card, label: "${w.keyIn}", stack: 3 }
  cards --> done(["${w.end}"])
`,
  ),
  sample(
    "interaction",
    (w) => `flowchart TD
  keys[^"${w.keyboard}"^] --- screen(="${w.screen}"=)
  keys --> ui["${w.route}: UI"]
  sensors@{ shape: lean-r, label: "${w.sensor}" } --> auto
  ui --- r1(>"R">) @{ legend: "${w.request}" } --> manual["${w.route} (${w.call})"]
  ui --- r2(>"C">) @{ legend: "${w.call}" } --> plans["${w.flightPlans}"]
  ui --- r3(>"E">) @{ legend: "${w.event}" } --> auto["${w.route}: auto"]
  timer["${w.timer}"] --> auto
  auto -->|~| plans
  plans --> flights(@"${w.flightPlans}"@)
  note[*"${w.channel}"*] -.- auto
`,
  ),
  sample(
    "manyExits",
    (w) => `flowchart TD
  start(["${w.start}"]) --> pick{"${w.query}?"}
  pick -->|1| a["${w.step} 1"]
  pick -->|2| b["${w.step} 2"]
  pick -->|3| c["${w.step} 3"]
  pick -->|4| d["${w.step} 4"]
  pick -->|5| e["${w.step} 5"]
  a --> stop(["${w.end}"])
  b --> stop
  c --> stop
  d --> stop
  e --> stop
`,
  ),
  sample(
    "retry",
    (w) => `flowchart TD
  start(["${w.start}"]) --> auth["${w.auth}"]
  auth --> hit{"${w.cache}?"}
  hit -->|${w.yes}| deliver[/"${w.deliver}"/]
  hit -->|${w.no}| tries{{"${w.retry}: 1..3"}}
  tries --> fetch["${w.fetch}"]
  fetch --> good{"${w.ok}?"}
  good -->|${w.no}| tries
  good -->|${w.yes}| parse["${w.parse}"]
  parse --> store[("${w.cache}")]
  store --> deliver
  tries -->|...| fail(["${w.fail}"])
  deliver --> stop(["${w.end}"])
  a1[*"${w.note}"*] -.- tries
`,
  ),
  sample(
    "sideways",
    (w) => `flowchart LR
  start(["${w.start}"]) --> read[^"${w.input}"^]
  subgraph work ["${w.part}"]
    read --> calc["${w.processOrder}"]
    calc --> pick{"${w.ok}?"}
  end
  pick -->|${w.yes}| out[~"${w.output}"~]
  pick -->|${w.no}| calc
  out --> stop(["${w.end}"])
  n1[*"${w.note}"*] -.- calc
  n2[*"${w.noteDetail}"*] -.- out
`,
  ),
  sample(
    "noteSides",
    (w) => `flowchart TD
  a["${w.step} 1"] --> b["${w.step} 2"] --> c["${w.step} 3"] --> d["${w.step} 4"]
  n1[*"${w.note}"*] -.- a
  n2[*"${w.noteDetail}"*] -.- b
  n3@{ shape: comment, label: "${w.note}", side: left } -.- c
  n4[*"${w.channel}"*] @{ side: left } -.- d
`,
  ),
  sample(
    "mermaidNames",
    (w) => `flowchart TD
  a@{ shape: rect, label: "rect" } --> b@{ shape: stadium, label: "stadium" }
  b --> c@{ shape: fr-rect, label: "fr-rect" }
  c --> d@{ shape: diam, label: "diam" }
  d --> e@{ shape: hex, label: "hex" }
  e --> f@{ shape: lean-r, label: "lean-r" }
  f --> g@{ shape: circ, label: "g" }
  g --> h@{
    shape: bow-rect
    label: "bow-rect"
  }
  h --> i@{ shape: win-pane, label: "win-pane" }
  i --> j@{ shape: h-cyl, label: "h-cyl" }
  j --> k@{ shape: doc, label: "doc" }
  k --> l@{ shape: flag, label: "flag" }
  l --> m@{ shape: sl-rect, label: "sl-rect" }
  m --> n@{ shape: notch-rect, label: "notch-rect" }
  n --> o@{ shape: curv-trap, label: "curv-trap" }
  o --> p@{ shape: trap-t, label: "trap-t" }
  p --> q@{ shape: fork }
  q --> r@{ shape: notch-pent, label: "r: loop-limit" }
  r --> s@{ shape: tri, label: "P", legend: "${w.transferPermanent}" }
  s -->|~| u@{ shape: loop-end, loop: "r" }
  u --> v@{ shape: div-rect, label: "div-rect", ref: "X1" }
  v --> x@{ shape: docs, label: "docs" }
  x --> y@{ shape: st-rect, label: "st-rect" }
  y --> z@{ shape: seq-store, label: "seq-store" }
  w@{ shape: brace, label: "brace" } -.- z
`,
  ),
  sample(
    "tricky",
    (w) => `flowchart TD
  a["~not a document~"] --> b[~still a process]
  b --> c["x; y %% z"]
  c --> d[(f(x))]
  d --> e["[(quoted)]"]
  e --> f{"a < b ${w.yes} / ${w.no}"}
  f -->|"${w.yes}; ${w.no}"| g[/"a/b"/]
  f -->|${w.no}| h[\\"a\\\\b"/]
  g --> i
  h --> i@{ label: "i", ident: "I", desc: "O", input: "in" }
`,
  ),
  sample(
    "pipeline",
    (w) => `flowchart TD
  start(["${w.start}"]) --> source@{ shape: docs, label: "${w.forms}", ident: "S1" }
  subgraph intake ["${w.stage} 1"]
    source --> read[^"${w.keyIn}"^]
    read --> check{"${w.ok}?"}
    check -->|${w.no}| fix[\\"${w.checkDetails}"/]
    fix --> read
  end
  check -->|${w.yes}| loopStart{^"i: i = 1..N"^}
  subgraph body ["${w.stage} 2"]
    loopStart --> work[["${w.processOrder}"]]
    work --> pair[=]
    pair --> a1["${w.step} 1"]
    pair --> a2["${w.step} 2"]
    a1 --> joined[=]
    a2 --> joined
  end
  joined --> loopEnd{_"i"_}
  loopEnd --> save[("${w.masterFile}")]
  save --> report@{ shape: doc, label: "${w.reports}", stack: 3, ref: "R7" }
  report --> stop(["${w.end}"])
  note1[*"${w.note}"*] -.- intake
  note2[*"${w.noteDetail}"*] -.- save
  note3[*"${w.toPage}"*] -.- stop
`,
  ),
] as const satisfies readonly DevSample[];

export type DevSampleId = (typeof DEV_SAMPLES)[number]["id"];
