# Syntax

A Rhumb diagram is plain text. It reads like a Mermaid flowchart, but it is
**not** Mermaid: it has more blocks, fewer features, and its own rules for
quotes and properties. Everything below is what the parser really accepts.

## Skeleton

```rhumb
flowchart TD
  start(["Start"]) --> read[/"Input N"/]
  read --> check{"N > 0?"}
  check -->|Yes| calc["S = N * 2"]
  check -->|No| stop(["End"])
  calc --> out[/"Output S"/]
  out --> stop
```

- The **first statement** is `flowchart` or `graph`, optionally followed by a
  direction: `TD` (same as `TB`, top to bottom, the default), `BT`, `LR` or
  `RL`. Use `TD` for algorithms unless the user asks for a wide scheme.
- Any other diagram type (`sequenceDiagram`, `classDiagram`, `gantt`, ...) is
  rejected with `Diagram type "..." is not supported yet`.
- A **statement** is one line. Several statements can share a line when
  separated by `;`.
- A **comment** starts with `%%` and runs to the end of the line. Comments and
  `;` are ignored inside double quotes.
- Indentation and blank lines mean nothing.

```rhumb
flowchart LR
  %% two statements on one line
  a["Read"] --> b["Process"]; b --> c["Write"]
```

## Identifiers

An identifier is made of letters (any alphabet), digits and `_`. It has no
spaces, hyphens, dots or other punctuation: `step_1` and `крок2` are fine,
`step-1` and `step 1` are not.

- A block is **defined** where its form is written: `check{"x > 0?"}`. Every
  later mention uses the bare identifier: `check`.
- A bare identifier that was never defined becomes a Process block whose text is
  the identifier. Define every block with a form and a text.
- A block belongs to the frame it is first named in (see
  [structure](references/structure.md)).

## Text of a block

Put the text in double quotes: `A["text"]`, `A{"text?"}`, `A[/"text"/]`.

- Always quote. Unquoted text ends at the first closing bracket, so
  `item[/Input a[i]/]` breaks, while `item[/"Input a[i]"/]` is fine. Quoting is
  also what keeps text that starts like another form (`~`, `*`, `#`) from being
  read as that form.
- The text cannot contain a double quote, and there is no escape for it. Use `'`
  or "guillemets" instead.
- A line break is `<br/>` or `\n` inside the quotes.
- The text is literal: no Markdown, no HTML other than `<br/>`, no icons.
- Keep it short: a few words per line, break long text with `<br/>`.

```rhumb
flowchart TD
  item[/"Input<br/>a[i]"/] --> calc["sum = sum + a[i]"]
```

## Lines

A line joins two blocks with an arrow token. Chains work: `A --> B --> C`.
Labels, line styles and special lines are in [lines](references/lines.md).

## Properties

Any block can carry properties in braces after its form, or in place of it:
`A["text"] @{ ident: "P1" }` or `A@{ shape: doc, label: "Report" }`. Keys:
`shape`, `label`, `ident`, `desc`, `input`, `ref`, `stack`, `loop`, `side`,
`legend`. Values are in double quotes, or bare up to the next comma. The braces
may span several lines. All keys are explained in [blocks](references/blocks.md).

## Not supported

These are errors, not warnings. Do not write them (see
[pitfalls](references/pitfalls.md) for the messages and the fixes): `classDef`,
`class`, `style`, `linkStyle`, `click`, `direction`, `:::` shorthand, `&` to
join several blocks, `A --o B`, `A --x B`, `<-->`, `~~~`, `subgraph "Title"`
without an identifier, edge identifiers, icons, Markdown strings,
`%%{init: ...}%%` directives (they are read as comments and do nothing).
