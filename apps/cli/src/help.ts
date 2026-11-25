export const MAIN_HELP = `rhumb - Standard-conforming flowcharts

Usage:
  rhumb <command> [options]

Commands:
  render [file]     Draw a diagram as SVG, PNG, JPEG or WebP
  check [files...]  Check diagrams without drawing them
  profiles [show]   List the standards, or print one as JSON
  presets           List the colour presets
  guide [topic]     Print the instructions an AI agent needs to write diagrams
  skill             Print or install a skill that points an AI agent at this CLI

Run "rhumb <command> --help" for the options of a command.
Input is a file, or the diagram piped in ("-" means the same).

Exit codes: 0 done, 1 the diagram is invalid or drawing failed, 2 wrong usage.

Options:
  -h, --help     Show help
  -v, --version  Show the version
`;

export const RENDER_HELP = `rhumb render - draw a diagram

Usage:
  rhumb render [file] [-o output] [options]

Input:
      --input-encoding <e> Encoding of the diagram: by default a BOM is read and
                           UTF-8 is required, so Cyrillic is never garbled
                           silently; for old files say windows-1251 or utf-16le

Output:
  -o, --output <path>      Where to write; "-" is stdout. The format follows the
                           extension (.svg .png .jpg .jpeg .webp). Without it
                           an SVG goes to stdout
      --format <name>      svg, png, jpeg or webp; overrides the extension
      --json               Print what was written as JSON instead of a sentence
      --no-xml-declaration Leave the <?xml ... encoding="UTF-8"?> line off an SVG
                           (it says UTF-8, so no tool has to guess)

Standard:
      --profile <id>       Standard to draw by (see "rhumb profiles"); the
                           default one when left out
      --profile-file <p>   A profile from a JSON file ("rhumb profiles show")

Look:
      --preset <name>      Colours to start from: print paper dark blueprint clear
      --ink <color>        Lines and text
      --fill <color>       Blocks
      --hollow             Leave blocks see-through
      --background <color> Page
      --transparent        Drop the page
      --label-background <color>  Behind labels that sit on a line
      --padding <px>       Space around the drawing, 0 to 96
      --radius <px>        Page corner radius, 0 to 48
      --pixels-per-mm <n>  Size of the drawing (4 by default)

Images:
      --scale <n>          Pixel density 1 to 4 (2 by default)
      --quality <n>        50 to 100, for JPEG and WebP

Fonts (not bundled; give the files the profile's font stack names):
      --font <name=file>   e.g. --font "OpenGost Type A=./OpenGost-A.ttf".
                           Images need a TTF or OTF file. Repeatable
`;

export const CHECK_HELP = `rhumb check - check diagrams without drawing them

Usage:
  rhumb check [files...] [--json]

Prints "OK" with the size of each diagram, or the first problem with its line
number. Exit code 1 if any diagram is invalid.

      --json                  Print the results as JSON
      --input-encoding <e>    See "rhumb render --help"
`;

export const PROFILES_HELP = `rhumb profiles - the standards Rhumb draws by

Usage:
  rhumb profiles [--json]        List them
  rhumb profiles show <id>       Print one as JSON (edit it, then use --profile-file)
`;

export const PRESETS_HELP = `rhumb presets - the colour presets

Usage:
  rhumb presets [--json]
`;

export const GUIDE_HELP = `rhumb guide - instructions for an AI agent that writes diagrams

Rhumb's syntax looks like Mermaid but is a different dialect, so an agent that
answers from what it knows about Mermaid gets it wrong. The instructions are
part of the CLI, so they always match the parser that is installed. Put what
you print in the agent's context; check what it writes with "rhumb check".

Usage:
  rhumb guide <topic>   One part only (cheapest): see --list
  rhumb guide --short   A cheat sheet, for a small context
  rhumb guide           The full instructions
  rhumb guide --list    The topics
`;

export const SKILL_HELP = `rhumb skill - a skill for AI agents that use this CLI

A few lines that send the agent to "rhumb guide", "rhumb check" and "rhumb
render", instead of a skill that holds the whole syntax. The agent loads only
the part of the instructions it needs.

Usage:
  rhumb skill                   Print SKILL.md
  rhumb skill --dir <folder>    Write <folder>/rhumb-diagrams/SKILL.md, e.g.
                                --dir ~/.claude/skills
`;
