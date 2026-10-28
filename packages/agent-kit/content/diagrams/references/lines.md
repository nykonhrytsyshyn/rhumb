# Lines

## Tokens

| Token  | Line                                           |
|--------|------------------------------------------------|
| `-->`  | Solid line with an arrow. The normal flow line |
| `---`  | Solid line without an arrow                    |
| `-.->` | Dashed line with an arrow                      |
| `-.-`  | Dashed line without an arrow                   |
| `==>`  | Thick line with an arrow                       |
| `===`  | Thick line without an arrow                    |

Longer runs (`--->`, `---->`) are accepted and mean the same. Anything else
(`--o`, `--x`, `<-->`, `~~~`) is an error. Use `-->` for the flow of control;
use plain lines (`---`) only where the standard calls for a link without
direction, for example between a block and a transfer of control.

## Labels

Two forms, with the same result:

```rhumb
flowchart TD
  a{"x > 0?"} -->|Yes| b["y = x"]
  a -- No --> c["y = -x"]
  b --> d(["End"])
  c --> d
```

- `-->|text|` puts the text between bars right after the token. The text
  cannot contain `|`.
- `-- text -->` needs a space on both sides of the text. The same works with
  `== text ==>` and `-. text .->`.
- A label is one short word or a few words: `Yes`, `No`, `1`, `a < 0`.
- Quotes are allowed in a label: `-->|"Yes; retry"|`.

## Branches of a decision

A decision has a line in and two or more lines out, **each out-line labelled**.

- Two-way decisions are labelled `Yes` and `No`, in the language of the diagram.
  The profile recognizes, ignoring case, `Yes`, `Y`, `True`, `+`, `Так`, `Да`
  for the first branch and `No`, `N`, `False`, `-`, `Ні`, `Нет` for the second,
  and puts each branch on the side the standard asks for. Any other wording
  works, but then the sides are not told apart by meaning: they are filled in
  the order the lines are written.
- A decision with more than two exits (a choice among values) gets one label
  per exit: the value, `1`, `2`, `3`, ... The exits take the free sides in the
  order they are written.
- Put the question in the decision's text and end it with `?` when it is a
  question: `{"x > 0?"}`.
- Never leave a branch unlabelled and never leave a branch out. If one outcome
  simply continues, still draw both lines.

## Loops drawn with lines

A loop is a line that goes back to an earlier block. Back lines are fine:

```rhumb
flowchart TD
  start(["Start"]) --> read[/"Input N"/]
  read --> fill{{"i = 0 .. N - 1"}}
  fill --> item[/"Input a[i]"/]
  item --> fill
  fill --> out[/"Output a"/]
  out --> stop(["End"])
```

When the flow comes back to a **preparation** block (hexagon), the renderer
treats it as the head of a counted loop: the line into the repeated part, the
returning lines and the exit leave from the sides the profile names. Write the
line into the body first, then the exit, as above. Loop-limit blocks are
another way to draw a loop, see [structure](references/structure.md).

## Special lines

- `-->|...|` marks an **omission**: blocks left out between two others. The
  text is three dots (or `…`). The line carries the omission symbol.
- `-->|~|` marks a **communication link**: the line carries the zigzag.

```rhumb
flowchart TD
  a["Prepare"] -->|...| b["Finish"]
  b -->|~| c["Remote system"]
```

- The line that ties a **comment** to a block or a frame is written `-.-`.
  It is always dashed, has no arrow and takes no label (see
  [structure](references/structure.md)).

## Merging and fan-out

- Several lines may enter one block; they merge before it.
- One block may have several lines out. In an algorithm a plain process with
  two lines out usually means a missing decision; in a data-flow or system
  diagram, where one block feeds several others, it is normal.
