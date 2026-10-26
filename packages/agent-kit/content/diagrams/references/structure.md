# Frames, comments, loops, parallel actions, transfers

## Frames

A frame is a dashed outline around blocks. Write it with `subgraph` and close it
with `end`:

```rhumb
flowchart TD
  start(["Start"]) --> load
  subgraph whole ["Whole job"]
    load["Load the list"]
    subgraph partial ["Check"]
      check{"Valid?"} -->|Yes| total["Total"]
      check -->|No| fix["Correct"]
      fix --> check
    end
    load --> check
    total --> save[("Master file")]
  end
  save --> stop(["End"])
```

- `subgraph id ["Title"]` or `subgraph id [Title]`; the title is optional
  (`subgraph id`). The identifier is required, so `subgraph "Title"` is an
  error.
- Frames nest. The identifier must be unused by any block or other frame.
- A block belongs to the frame it is **first named** in. Naming it again later,
  anywhere, only adds lines. Naming a block inside a second, unrelated frame is
  an error.
- A frame must hold at least one block.
- A frame cannot be given a shape, and a line cannot start or end at a frame.
  Only a comment can be tied to a frame.
- Every `subgraph` needs its `end`.

## Comments

A comment is a block `n[*"text"*]` tied to a block or a frame by a dashed link.
It always stands beside what it explains.

```rhumb
flowchart TD
  a["Read the file"] --> b{"Empty?"}
  b -->|Yes| c(["End"])
  b -->|No| a
  n1[*"Reads in blocks of 512 bytes"*] -.- a
  n2[*"Stops at the first empty record"*] @{ side: left } -.- b
```

- The link is `-.-` in either direction (`n -.- a` or `a -.- n`). It takes no
  label and is always dashed without an arrow.
- Every comment has **exactly one** link. A comment with none, or with two, is
  an error, and a comment cannot be tied to another comment.
- `@{ side: left }` chooses the side: `right`, `left`, `top` or `bottom`.
  Without it the layout chooses. Comments on one side line up in one column.

## Loop limits

Use these when a loop has a name and a condition checked at its head and a
matching tail:

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

- The start is `{^"name: condition"^}`: the name before the first colon joins
  it to its end, the rest is the condition drawn in the block.
- The end is `{_"name"_}`. Its text is the name.
- Pairs are matched by name, so nested loops need different names. The same can
  be set explicitly with `@{ loop: "i" }`.
- Every start needs an end and the other way round.

A counted loop can also be drawn with a preparation block and a returning line
(see [lines](references/lines.md)); pick one style and keep to it in a diagram.

## Parallel actions

A bar `[=]` has no text. One bar splits the flow, another joins it. The bar
stretches over the lines it takes in and gives out, and each line ends at its
own point.

```rhumb
flowchart TD
  go(["Start"]) --> a["Prepare"]
  a --> fork[=]
  fork --> b["Task B"]
  fork --> c["Task C"]
  fork --> d["Task D"]
  b --> join[=]
  c --> join
  d --> join
  join --> done(["End"])
```

Use two bars, a fork and a join, never one bar for both.

## Transfer of control

A small block marked by **one letter**; the meaning of each letter is listed in
a legend under the diagram. It sits on a plain line (`---`) between the blocks,
and the flow continues on the other side.

```rhumb
flowchart TD
  ui["Menu"] --- r1(>"R">) @{ legend: "Request" } --> manual["Manual route"]
  ui --- r2(>"C">) @{ legend: "Call" } --> plans["Flight plans"]
```

- The text is exactly one letter. `legend` belongs to transfers only.
- One letter must not stand for two different meanings in one diagram.
- The same letter may be used again; give the legend once, or repeat the same
  text.

## Connectors and several sheets

A connector is a circle with a letter or a number. A break in a line is drawn
as two circles with the **same text**: one where the line leaves, one where it
continues. They are separate blocks with different identifiers and are not
joined by a line.

```rhumb
flowchart TD
  a["First part"] --> out1(("A"))
  in1(("A")) --> b["Second part"]
  b --> stop(["End"])
```

For a part that is drawn in detail on another sheet, mark the block with a `ref`
stripe (`@{ ref: "X84" }`) and head that sheet with start / end blocks that
repeat the reference.

## Stacks and stripes

- `@{ stack: 3 }` draws overlapping copies (2 to 8): several documents, several
  identical processes.
- `@{ ref: "X84" }` draws the stripe that points to a detailed sheet.
- Neither applies to parallel bars, comments, transfers or connectors.
