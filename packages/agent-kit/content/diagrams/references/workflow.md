# Workflow

## 1. Read the request

Find out what is being drawn and from what:

- **Code or pseudocode**: follow its control flow exactly. Loops, branches and
  calls in the code are loops, decisions and predefined processes in the
  diagram.
- **A description in words**: turn each step into one block, decide its kind
  by what the step means (see [blocks](references/blocks.md)).
- **An existing Rhumb or Mermaid diagram**: keep its structure; change only what
  was asked. If it is Mermaid, translate it and say what had to go (styles,
  other diagram types).

## 2. Decide whether to ask

Draft first. Ask only when the answer would change the diagram, and ask
everything you need **in one message**, at most three questions, each with the
choices spelled out so that one word answers it. If the request is clear enough,
do not ask: write the diagram and list your assumptions under it.

Questions that are worth asking, when the request does not settle them:

1. **Standard**: GOST 19.701-90 or ISO 5807? It changes which sides the Yes and
   No branches leave from. If the user does not know, the app's default profile
   is fine; say which assumption you made.
2. **Language of the labels**: the language of the conversation, unless the user
   says otherwise. Ask only if the source text and the conversation differ (for
   example Ukrainian code comments in an English chat).
3. **Detail**: one block per statement, or one block per stage? A whole program
   in one scheme usually needs stages with predefined processes and a separate
   scheme for each.
4. **Sheet**: wide (`LR`) or tall (`TD`)? Does the scheme have to be split
   across sheets with connectors and `ref` stripes?
5. **Extras**: identifiers (`ident`), descriptions (`desc`), comments, frames.
   Offer them; never add them unasked to a short diagram.

Do not ask what you can read from the input (the language of the code, the
number of loops), and never ask about colors or fonts: Rhumb has none to choose
from; fonts and sizes are in the profile.

When you ask, write the options so the user can answer in one word. For
example: "Standard: GOST 19.701-90 or ISO 5807? Direction: tall (TD) or wide
(LR)?"

## 3. Write

- Start from the skeleton in [syntax](references/syntax.md); quote every text.
- Identifiers: short, meaningful, `snake_case` or camelCase letters and digits:
  `read`, `check_sign`, `loop_i`.
- Exactly one Start block `([...])` and at least one End block. Every other
  block has a line in and a line out.
- Every decision has labeled branches; every loop returns or closes.
- Keep one idea per block. Long text goes on several lines with `<br/>`.
- Order the text so the main flow reads top to bottom: write the main path
  first, then side branches.

## 4. Check

<!-- skill-only -->
If you can run commands, save the diagram to a file and run the checker that
comes with this skill:

```
node scripts/validate.mjs diagram.rhumb
```

It prints `OK: ...` or the first problem as `Line N: message`, and exits with
0 or 1. Fix the line it names and run it again; stop after five rounds and tell
the user what still fails. The checker reads the diagram exactly as the app
does, so a diagram that passes here is accepted there.
<!-- /skill-only -->

When you cannot run anything, go through this list before you answer:

1. The first statement is `flowchart` or `graph` with a direction.
2. Every identifier is letters, digits and `_` only.
3. Every text is in double quotes and holds no double quote.
4. Every `subgraph` has its `end`, an identifier and at least one block.
5. Every loop start has its end with the same name.
6. Every comment has exactly one `-.-` link.
7. Nothing from the "not supported" list appears.
8. Every decision has all its branches labelled.

## 5. Deliver

1. The diagram in one fenced block tagged `rhumb`, never `mermaid`.
2. Under it, a short list: the assumptions you made, and anything you
   could not draw and why.
3. One line on how to use it: paste it into the **Code** tab of Rhumb
   ({{homepage}}), pick the standard in the **Config** tab, and export SVG or
   PNG.
4. Offer the next step: stages, comments, another standard.

When the user comes back with an error message from the app, it is the same
message the checker prints. Find the line, find the message in
[pitfalls](references/pitfalls.md), fix only that.
