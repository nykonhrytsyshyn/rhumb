# Pitfalls: what Mermaid habits break, and what the errors mean

Each snippet marked `rhumb-invalid` is checked by the project's tests: it really
fails with the message shown in its first line. The message always starts with
`Line N:`, the line of the text where the problem is.

## Styling and other Mermaid statements

Rhumb draws by the standard, so there is nothing to style.
`classDef`, `class`, `style`, `linkStyle`, `click` and `direction` are
rejected. Remove them; do not try to replace them with colors.

```rhumb-invalid
%% error: "classDef" is not supported yet
flowchart TD
  a["Start"] --> b["End"]
  classDef hot fill:#f96
```

```rhumb-invalid
%% error: "direction" is not supported yet
flowchart TD
  subgraph s ["Part"]
    direction LR
    a["One"] --> b["Two"]
  end
```

## Other diagram types

Only flowcharts are drawn. For a sequence, class, state, ER or Gantt diagram,
tell the user Rhumb cannot draw it and offer Mermaid for that one instead.

```rhumb-invalid
%% error: Diagram type "sequenceDiagram" is not supported yet
sequenceDiagram
  A->>B: hello
```

## Text that is not quoted

Unquoted text ends at the first closing bracket. A bracket inside the text
(`a[i]`, `f(x)`, `{}`) cuts it short and the rest is left over:

```rhumb-invalid
%% error: Expected a link such as -->
flowchart TD
  a["Start"] --> b[a[i] = 0]
```

Fix: `b["a[i] = 0"]`. Quote every text and this never happens.

## A double quote inside the text

There is no escape for `"`. Replace it with `'` or «».

```rhumb-invalid
%% error: Expected "]" after quoted text
flowchart TD
  a["say "hi""] --> b["End"]
```

## Identifiers with punctuation

An identifier is letters, digits and `_`. A hyphen ends it, and what follows is
read as a line token:

```rhumb-invalid
%% error: Expected a link such as -->
flowchart TD
  step-1["Read"] --> step_2["Write"]
```

Fix: `step_1`.

## Joining blocks with `&`

Mermaid's `A --> B & C` is not understood. Write one line per target:
`A --> B` and `A --> C`.

```rhumb-invalid
%% error: Expected a link such as -->
flowchart TD
  a["Start"] --> b["One"] & c["Two"]
```

## A label without spaces around its text

In `-- text -->` the text needs a space on both sides:

```rhumb-invalid
%% error: Expected a link such as -->
flowchart TD
  a{"Ok?"} -- Yes--> b["Go"]
```

Fix: `a -- Yes --> b`, or `a -->|Yes| b`.

## Frames

```rhumb-invalid
%% error: Expected a frame such as
flowchart TD
  subgraph "Only a title"
    a["One"]
  end
```

Fix: `subgraph part ["Only a title"]`.

```rhumb-invalid
%% error: Missing "end" for the subgraph "part"
flowchart TD
  subgraph part ["Part"]
    a["One"] --> b["Two"]
```

```rhumb-invalid
%% error: The frame "part" holds no blocks
flowchart TD
  a["One"] --> b["Two"]
  subgraph part ["Empty"]
  end
```

## Properties

```rhumb-invalid
%% error: is given a shape twice
flowchart TD
  a["Report"] @{ shape: doc } --> b["End"]
```

Give the shape once: `a@{ shape: doc, label: "Report" }` or `a[~"Report"~]`.

```rhumb-invalid
%% error: Unknown shape "cloud"
flowchart TD
  a@{ shape: cloud, label: "Cloud" } --> b["End"]
```

Only the shape names in [blocks](references/blocks.md) exist. Pick the block of
the standard that means the same, not one that looks similar.

```rhumb-invalid
%% error: Unknown key "color"
flowchart TD
  a["One"] @{ color: red } --> b["Two"]
```

```rhumb-invalid
%% error: side belongs to comments only
flowchart TD
  a["One"] @{ side: left } --> b["Two"]
```

## Comments, loops and transfers

```rhumb-invalid
%% error: is not linked to a block or a frame
flowchart TD
  a["One"] --> b["Two"]
  n[*"Lonely note"*]
```

```rhumb-invalid
%% error: has no end to match
flowchart TD
  a["Start"] --> loop1{^"i: i = 1..N"^}
  loop1 --> b["Work"]
```

```rhumb-invalid
%% error: already stands for
flowchart TD
  a["One"] --- t1(>"P">) @{ legend: "Permanent" } --> b["Two"]
  b --- t2(>"P">) @{ legend: "Pending" } --> c["Three"]
```

## Mistakes that are not errors

The parser accepts these; the diagram is still wrong. Check for them before you
deliver:

- A decision with one labelled branch, or with unlabelled branches.
- A block nothing leads to, or a block that leads nowhere and is not an end.
- Several start blocks, or no end block.
- Process rectangles everywhere, where the standard has a more exact block.
- A mix of two loop styles in one diagram.
- Labels in a different language from the user's.
- A diagram in a fence tagged `mermaid`. Rhumb's own forms (`[~x~]`,
  `[^x^]`, `{^x^}`, ...) are not Mermaid; a Mermaid renderer shows an error.
  Tag the fence `rhumb`.
