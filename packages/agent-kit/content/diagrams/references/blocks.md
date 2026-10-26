# Blocks

Rhumb draws the blocks of ISO 5807. Pick the block by what the step **means**,
not by looks. Using a plain Process rectangle for everything is the most common
way to get a wrong diagram.

## All blocks

Short forms are written with a quoted text. `A` is any identifier.

| Block                     | Short form                     | By name (`shape:`)                                      | Use it for                                                           |
|---------------------------|--------------------------------|---------------------------------------------------------|----------------------------------------------------------------------|
| Process                   | `A["text"]`                    | `rect`, `proc`, `process`                               | Any operation or group of operations that changes data               |
| Start / end               | `A(["text"])` or `A("text")`   | `stadium`, `terminal`, `pill`                           | Start, end, stop, entry or exit of a routine                         |
| Decision                  | `A{"text?"}`                   | `diam`, `diamond`, `decision`, `question`               | A condition with two or more outgoing branches                       |
| Input / output            | `A[/"text"/]` or `A[\"text"\]` | `lean-r`, `lean-l`, `in-out`, `out-in`, `io`            | Data entering or leaving the process, medium not specified           |
| Preparation               | `A{{"text"}}`                  | `hex`, `hexagon`, `prepare`                             | Initialisation, and the head of a counted loop (`for`)               |
| Predefined process        | `A[["text"]]`                  | `fr-rect`, `subproc`, `subroutine`                      | A call of a subroutine or an algorithm described elsewhere           |
| Connector                 | `A(("X"))`                     | `circ`, `circle`, `connector`                           | A break and a continuation of a line, on one sheet or between sheets |
| Stored data               | `A[)"text"(]`                  | `bow-rect`, `stored-data`                               | Data stored in a form suitable for processing                        |
| Internal storage          | `A[#"text"#]`                  | `win-pane`, `internal-storage`                          | Data kept in memory during the run                                   |
| Sequential-access storage | `A(@"text"@)`                  | `seq-store`, `sequential-storage`, `tape`               | Tape-like storage, read in order                                     |
| Direct-access storage     | `A[("text")]`                  | `cyl`, `cylinder`, `db`, `database`, `das`, `h-cyl`     | A database, a disk, a file read at random                            |
| Document                  | `A[~"text"~]`                  | `doc`, `document`                                       | A printed or handwritten document, a report                          |
| Paper tape                | `A[~~"text"~~]`                | `flag`, `paper-tape`                                    | Data on paper tape                                                   |
| Manual input              | `A[^"text"^]`                  | `sl-rect`, `manual-input`, `sloped-rectangle`           | Data typed in by a person: keyboard, switches                        |
| Card                      | `A[:"text":]`                  | `notch-rect`, `card`                                    | A punched card or a similar card                                     |
| Display                   | `A(="text"=)`                  | `curv-trap`, `display`                                  | Data shown to the person on a screen                                 |
| Manual operation          | `A[\"text"/]`                  | `trap-t`, `manual`, `manual-operation`, `inv-trapezoid` | An operation a person performs by hand                               |
| Parallel actions          | `A[=]`                         | `fork`, `join`, `parallel`                              | Start or end of actions that run at the same time (no text)          |
| Loop limit, start         | `A{^"name: condition"^}`       | `loop-start`, `loop-limit`, `notch-pent`                | The head of a loop whose condition is checked here                   |
| Loop limit, end           | `A{_"name"_}`                  | `loop-end`                                              | The tail of that loop                                                |
| Transfer of control       | `A(>"X">)`                     | `tri`, `extract`, `triangle`, `transfer`                | A transfer of control, marked by one letter                          |
| Comment                   | `A[*"text"*]`                  | `brace`, `brace-l`, `brace-r`, `comment`                | An explanation tied to a block or a frame                            |

Mermaid's own forms keep working for the blocks Mermaid has: `[text]`,
`([text])`, `{text}`, `[/text/]`, `{{text}}`, `[[text]]`, `((text))`,
`[(text)]`, and `A@{ shape: ... }`. The forms with `~`, `^`, `:`, `#`, `@`, `=`,
`>`, `_` and `*` are Rhumb's own.

Block-by-name examples:

```rhumb
flowchart TD
  a@{ shape: manual-input, label: "Keyboard input" } --> b@{ shape: db, label: "Orders" }
  b --> c@{ shape: doc, label: "Invoice" }
```

Stacked copies are written with names too: `docs` (3 documents), `procs` or
`st-rect` (3 processes). `div-rect` is a process with a reference stripe.

## Choosing between similar blocks

- **Input / output** is the general block. Use **Manual input** only when a
  person types the data, **Display** only when it is shown on a screen,
  **Document** only when it is printed. If the medium is unknown, use
  Input / output.
- **Process** is one operation or a short group of them. A call of something
  that has its own diagram or is a known routine is a **Predefined process**.
- **Preparation** (hexagon) opens a counted loop: `for i = 1..N`. Use **Loop
  limit** blocks when the condition is checked at the start or the end of a
  loop and the loop has a name (see [structure](references/structure.md)).
- **Direct-access storage** is for databases and files; **Internal storage**
  is for variables and arrays in memory.

## Properties of a block

Written as `A["text"] @{ key: "value", key: "value" }`, or
`A@{ shape: name, label: "text" }`. Never give the shape twice (in a form and in
`shape:`).

| Key      | Meaning                                                                 | Applies to                                        |
|----------|-------------------------------------------------------------------------|---------------------------------------------------|
| `shape`  | The block by name (table above)                                         | any                                               |
| `label`  | The text, when the block is written by name                             | any except parallel actions                       |
| `ident`  | Symbol identifier, drawn above the block on the left                    | any                                               |
| `desc`   | Description, above the block on the right                               | any                                               |
| `input`  | Description, below the block on the right                               | any                                               |
| `ref`    | A stripe that points to a detailed sheet, `ref: "X84"`                  | any except parallel, comment, transfer, connector |
| `stack`  | Overlapping copies, a whole number from 1 to 8 (2 or more draws copies) | same as `ref`                                     |
| `loop`   | The name that joins two loop limits                                     | loop limits only                                  |
| `side`   | `right`, `left`, `top` or `bottom`                                      | comments only                                     |
| `legend` | What the letter of a transfer stands for                                | transfers only                                    |

```rhumb
flowchart TD
  a["Calculate tax"] @{ ident: "P1", desc: "per item", ref: "X84" } --> b@{ shape: docs, label: "Invoices", ident: "D1" }
```

A key that does not apply to the block, a key that is not in the table, and a
key given twice are all errors.
