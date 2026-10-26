---
name: "rhumb-diagrams"
description: "Write, fix and explain flowcharts in Rhumb's Mermaid-like text syntax, which Rhumb draws as standard-conforming block diagrams (GOST 19.701-90, ISO 5807). Use whenever the user mentions Rhumb or rhumb.nykon.me, asks for a flowchart, block diagram, algorithm scheme or program flow in the style of a standard (блок-схема, схема алгоритму, схема за ГОСТ або ДСТУ), or pastes Rhumb or Mermaid flowchart text to repair or convert. Rhumb's syntax is NOT Mermaid: it has extra blocks (document, manual input, loop limits, parallel actions, transfer of control, comments) and rejects styling, so do not answer from general Mermaid knowledge. Not for sequence, class, state, ER or Gantt diagrams."
license: "MIT"
metadata:
  version: "{{version}}"
  homepage: "{{homepage}}"
---

# Rhumb diagrams

Rhumb ({{homepage}}) turns Mermaid-like text into flowcharts that follow
ISO 5807: every step has the block the standard gives it, lines enter and leave
on the sides the standard asks for, and the result is exported as SVG or PNG.

The text is a **dialect of Mermaid's flowchart**, not Mermaid. The common core
(`flowchart TD`, `A --> B`, `{decision}`) is the same; the rest is different.
Anything you know about Mermaid that is not written here may be rejected, so
follow the references, not memory.

## When this applies

- The user wants a flowchart, an algorithm scheme or a block diagram, above all
  one for a report, a lab, a thesis or a specification.
- The user gives code, pseudocode or a description and wants it drawn.
- The user gives Rhumb text (or Mermaid flowchart text) to fix, extend,
  translate or explain.

If the user wants another kind of diagram (sequence, class, state, ER, Gantt),
say Rhumb draws flowcharts only and offer Mermaid for that diagram.

## Workflow

1. **Read** what is being drawn: code, steps in words, or existing text.
2. **Ask only if the answer changes the diagram**: otherwise draft first and
   state your assumptions. At most three questions, in one message, each with
   its choices spelled out. Details in [workflow](references/workflow.md).
3. **Write** the diagram with the blocks the standard prescribes
   ([blocks](references/blocks.md)).
4. **Check** it.
<!-- skill-only -->
   If you can run commands, save the text to a file and run
   `node scripts/validate.mjs diagram.rhumb`; fix what it reports and run it
   again. Otherwise, go through the checklist in
   [workflow](references/workflow.md).
<!-- /skill-only -->
<!-- prompt-only -->
   Go through the checklist in [workflow](references/workflow.md) before you
   answer.
<!-- /prompt-only -->
5. **Deliver** one fenced block tagged `rhumb`, the assumptions, and one line on
   how to open it in Rhumb.

## Rules that break the most diagrams

1. First statement: `flowchart TD` (or `LR`, `BT`, `RL`). Flowcharts only.
2. **Quote every text**: `A["text"]`, `A{"x > 0?"}`, `A[/"Input a[i]"/]`. No
   double quote inside; line break with `<br/>`.
3. Identifiers are letters, digits and `_` only: `step_1`, not `step-1`.
4. **Use the right block**, not a rectangle for everything: terminator for start
   and end, parallelogram for input and output, diamond for a decision, hexagon
   for a counted loop, double-sided rectangle for a call, cylinder for a
   database, and so on. The full table is in [blocks](references/blocks.md).
5. One Start, at least one End. Every decision has **all** its branches labeled
   (`Yes` / `No`, or the values).
6. No styling and no other Mermaid statements: `classDef`, `class`, `style`,
   `linkStyle`, `click`, `direction`, `:::`, `&` are errors.
7. Labels in the language of the conversation, short, a few words per line.
8. Fence the result with the tag `rhumb`, never `mermaid`.
9. If Rhumb cannot draw something, say so; do not fake it with a look-alike
   block or invented syntax.

## References

Read the one you need; they are short.

- [Syntax](references/syntax.md): skeleton, identifiers, quoting, comments,
  what is not supported.
- [Blocks](references/blocks.md): every block, its forms and names, its
  properties (`ident`, `desc`, `ref`, `stack`, ...).
- [Lines](references/lines.md): line kinds, labels, decision branches, loops by
  line, omissions and communication links.
- [Structure](references/structure.md): frames, comments, loop limits, parallel
  actions, transfer of control, connectors and sheets.
- [Pitfalls](references/pitfalls.md): Mermaid habits that fail, with the exact
  error messages and their fixes.
- [Workflow](references/workflow.md): when to ask, what to ask, how to check and
  deliver.
- [Examples](references/examples.md): eight complete diagrams to copy the shape
  of.
