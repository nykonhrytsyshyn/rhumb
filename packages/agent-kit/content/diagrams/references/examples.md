# Complete examples

Every diagram here is rendered by the project's tests, so each is valid.
Copy the shape that is closest to the request, not the text.

## An algorithm with a branch

```rhumb
flowchart TD
  start(["Start"]) --> read[/"Input x"/]
  read --> check{"x > 0?"}
  check -->|Yes| positive["y = x"]
  check -->|No| negative["y = -x"]
  positive --> out[/"Output y"/]
  negative --> out
  out --> stop(["End"])
```

## A counted loop with a preparation block

```rhumb
flowchart TD
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
  out --> stop(["End"])
```

## Nested named loops

```rhumb
flowchart TD
  start(["Start"]) --> read[/"Input N"/]
  read --> outer{^"i: i = 1..N"^}
  outer --> inner{^"j: j = 1..i"^}
  inner --> act["a[i][j] = i * j"]
  act --> innerEnd{_"j"_}
  innerEnd --> sum["s = s + i"]
  sum --> outerEnd{_"i"_}
  outerEnd --> show[/"Output s"/]
  show --> stop(["End"])
```

## A retry with an omission

```rhumb
flowchart TD
  start(["Start"]) --> auth["Authorise"]
  auth --> hit{"In the cache?"}
  hit -->|Yes| deliver[/"Deliver"/]
  hit -->|No| tries{{"Attempt: 1..3"}}
  tries --> fetch["Fetch"]
  fetch --> good{"Succeeded?"}
  good -->|No| tries
  good -->|Yes| parse["Parse"]
  parse --> store[("Cache")]
  store --> deliver
  tries -->|...| fail(["Failure"])
  deliver --> stop(["End"])
  note[*"After three failures give up"*] -.- tries
```

## A data-flow scheme

```rhumb
flowchart TD
  cheques@{ shape: docs, label: "Cheques", ident: "D1" } --> check[\"Check the details"/]
  check --> keyIn[^"Key in"^]
  keyIn --> reg[["Register"]]
  reg --> master[("Master file")]
  reg --> receipts[~"Receipts"~]
  master --> sort[\"Sort by the blank"/]
  sort --> list@{ shape: docs, label: "Blank list" }
  sort --> archive(@"Tape"@)
  receipts -.- note[*"Receipts go to the customer"*]
  archive --> forms@{ shape: doc, label: "Forms", desc: "A4" }
```

## A system scheme with transfers of control

```rhumb
flowchart TD
  keys[^"Keyboard"^] --- screen(="Screen"=)
  keys --> ui["Route: UI"]
  sensors@{ shape: lean-r, label: "Sensor" } --> auto
  ui --- r1(>"R">) @{ legend: "Request" } --> manual["Route (call)"]
  ui --- r2(>"C">) @{ legend: "Call" } --> plans["Flight plans"]
  ui --- r3(>"E">) @{ legend: "Event" } --> auto["Route: auto"]
  auto -->|~| plans
  plans --> flights(@"Flight plans"@)
  link[*"Communication channel"*] -.- auto
```

## Frames and several comments

```rhumb
flowchart TD
  start(["Start"]) --> read[^"Input"^]
  subgraph intake ["Stage 1"]
    read --> check{"Valid?"}
    check -->|No| fix[\"Correct"/]
    fix --> read
  end
  check -->|Yes| save[("Master file")]
  save --> stop(["End"])
  n1[*"Input comes from the terminal"*] -.- intake
  n2[*"Written once per run"*] @{ side: left } -.- save
```

## Parallel actions inside a loop

```rhumb
flowchart TD
  start(["Start"]) --> source@{ shape: docs, label: "Forms", ident: "S1" }
  source --> loopStart{^"i: i = 1..N"^}
  loopStart --> work[["Process the form"]]
  work --> pair[=]
  pair --> a1["Step 1"]
  pair --> a2["Step 2"]
  a1 --> joined[=]
  a2 --> joined
  joined --> loopEnd{_"i"_}
  loopEnd --> report@{ shape: doc, label: "Report", stack: 3, ref: "R7" }
  report --> stop(["End"])
```

## A wide scheme split over two sheets

```rhumb
flowchart LR
  start(["Start"]) --> read[^"Input"^]
  read --> calc["Calculate"]
  calc --> out1(("A"))
  in1(("A")) --> show(="Result"=)
  show --> stop(["End"])
```
