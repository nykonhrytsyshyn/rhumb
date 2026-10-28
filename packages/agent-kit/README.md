# @rhumb/agent-kit

Skills and prompts that teach AI agents to write diagrams in Rhumb's own syntax.
Rhumb looks like Mermaid but is a different dialect, so an agent that answers
from what it knows about Mermaid gets it wrong. This package is the one place
that says what is right, and it is checked against the parser.

## What it makes

The site serves these files under `/agents/` (the web app has buttons for them
in the Docs tab):

| File                             | For                                                        |
| -------------------------------- | ---------------------------------------------------------- |
| `rhumb-diagrams.zip`             | An agent that supports skills: the `rhumb-diagrams` folder |
| `rhumb-diagrams-prompt.md`       | Any chat: the whole skill as one text                      |
| `rhumb-diagrams-prompt-short.md` | Any chat with a small context: a cheat sheet               |

## Editing the content

Edit the Markdown in `content/`. The tests then do the checking:

- Every fence tagged `rhumb` must be valid and must render under every built-in
  profile. Every fence tagged `rhumb-invalid` must fail with the message in its
  first line (`%% error: ...`), and the app must reject it with that message.
- Every short form, every block and every property the parser knows must appear
  in `blocks.md` and in the short prompt, so a new block cannot be forgotten.
- `SKILL.md` has a valid name and description and stays under 500 lines, every
  link to a reference resolves, and audience markers are paired.

Placeholders `{{version}}` and `{{homepage}}` are filled in at build time.
Text between `<!-- skill-only -->` and `<!-- /skill-only -->` appears only in
the skill folder, and between `<!-- prompt-only -->` and `<!-- /prompt-only -->`
only in prompts. In prompts, links to `references/*.md` become mentions of the
section further down.

Write the content in English. The agent answers in the language of the person
and writes the labels of the diagram in it as well.

## Adding a skill

Add a folder under `content/`, list its files in `src/api/kit/manifest.ts` and
build them in `build-agent-kit.ts`. The profile skill (rewriting a JSON profile
to a standard's requirements) is the planned next one.
