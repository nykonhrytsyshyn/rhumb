import { createRhumb } from "@nykon/rhumb/node";
import { EXPORT_PRESETS, EXPORT_PRESET_IDS } from "@nykon/rhumb/node";

import { PRESETS_HELP, PROFILES_HELP } from "../help";
import { EXIT_OK, type Io, UsageError } from "../io";
import { parse } from "../options";

export function profilesCommand(args: readonly string[], io: Io): number {
  const { values, positionals } = parse(args, {
    json: { type: "boolean" },
    help: { type: "boolean", short: "h" },
  });

  if (values.help === true) {
    io.writeStdout(PROFILES_HELP);

    return EXIT_OK;
  }

  const rhumb = createRhumb();
  const [action, id, ...extra] = positionals;

  if (action === "show") {
    if (id === undefined || extra.length > 0) {
      throw new UsageError("Usage: rhumb profiles show <id>");
    }

    let profile;

    try {
      profile = rhumb.profile(id);
    } catch {
      throw new UsageError(
        `No profile "${id}". Known: ${rhumb
          .profiles()
          .map((known) => known.id)
          .join(", ")}`,
      );
    }

    io.writeStdout(`${JSON.stringify(profile, null, 2)}\n`);

    return EXIT_OK;
  }

  if (action !== undefined) {
    throw new UsageError(
      `Unknown action "${action}". Try: rhumb profiles show <id>`,
    );
  }

  const list = rhumb.profiles();

  if (values.json === true) {
    io.writeStdout(
      `${JSON.stringify(
        list.map(
          ({ id: profileId, title, description, default: isDefault }) => ({
            id: profileId,
            title,
            description,
            default: isDefault,
          }),
        ),
        null,
        2,
      )}\n`,
    );

    return EXIT_OK;
  }

  const width = Math.max(...list.map((profile) => profile.id.length));

  for (const profile of list) {
    const mark = profile.default ? "  (default)" : "";

    io.writeStdout(`${profile.id.padEnd(width)}  ${profile.title}${mark}\n`);
  }

  return EXIT_OK;
}

export function presetsCommand(args: readonly string[], io: Io): number {
  const { values } = parse(args, {
    json: { type: "boolean" },
    help: { type: "boolean", short: "h" },
  });

  if (values.help === true) {
    io.writeStdout(PRESETS_HELP);

    return EXIT_OK;
  }

  if (values.json === true) {
    io.writeStdout(`${JSON.stringify(EXPORT_PRESETS, null, 2)}\n`);

    return EXIT_OK;
  }

  const width = Math.max(...EXPORT_PRESET_IDS.map((name) => name.length));

  for (const name of EXPORT_PRESET_IDS) {
    const { ink, fill, background, hollow, transparent } = EXPORT_PRESETS[name];
    const page = transparent ? "transparent" : background;

    io.writeStdout(
      `${name.padEnd(width)}  ink ${ink}  blocks ${hollow ? "hollow" : fill}  page ${page}\n`,
    );
  }

  return EXIT_OK;
}
