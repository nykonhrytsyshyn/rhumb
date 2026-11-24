import { writeFile } from "node:fs/promises";
import { extname } from "node:path";

import {
  EXPORT_FORMATS,
  EXPORT_PRESET_IDS,
  type ExportPresetId,
  type FontSource,
  type ImageOptions,
  type Rhumb,
  type StandardProfile,
  createRhumb,
  exportExtension,
  fontFamilies,
  loadFont,
} from "@nykon/rhumb/node";

import { RENDER_HELP } from "../help";
import { readSource, readTextFile } from "../input";
import { EXIT_OK, type Io, UsageError } from "../io";
import { parse, toNumber } from "../options";

type Format = (typeof EXPORT_FORMATS)[number];

const EXTENSIONS: Readonly<Record<string, Format>> = {
  ".svg": "svg",
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

function chooseFormat(
  flag: string | undefined,
  output: string | undefined,
): Format {
  if (flag !== undefined) {
    const known = EXPORT_FORMATS.find((format) => format === flag);

    if (known === undefined) {
      throw new UsageError(
        `--format expects ${EXPORT_FORMATS.join(", ")}; got "${flag}"`,
      );
    }

    return known;
  }

  if (output === undefined || output === "-") {
    return "svg";
  }

  const fromPath = EXTENSIONS[extname(output).toLowerCase()];

  if (fromPath === undefined) {
    throw new UsageError(
      `Cannot tell the format from "${output}": end it with .svg .png .jpg .webp, or pass --format`,
    );
  }

  return fromPath;
}

function chooseScale(value: number | undefined): ImageOptions["scale"] {
  if (value === undefined) {
    return undefined;
  }

  if (value !== 1 && value !== 2 && value !== 3 && value !== 4) {
    throw new UsageError(`--scale expects 1, 2, 3 or 4, got ${String(value)}`);
  }

  return value;
}

function choosePreset(name: string | undefined): ExportPresetId | undefined {
  if (name === undefined) {
    return undefined;
  }

  const preset = EXPORT_PRESET_IDS.find((id) => id === name);

  if (preset === undefined) {
    throw new UsageError(
      `--preset expects ${EXPORT_PRESET_IDS.join(", ")}; got "${name}"`,
    );
  }

  return preset;
}

async function loadFonts(specs: readonly string[]): Promise<FontSource[]> {
  return Promise.all(
    specs.map(async (spec) => {
      const split = spec.indexOf("=");

      if (split <= 0 || split === spec.length - 1) {
        throw new UsageError(
          `--font expects "Family Name=path/to/file.ttf", got "${spec}"`,
        );
      }

      const family = spec.slice(0, split).trim();
      const path = spec.slice(split + 1).trim();

      try {
        return await loadFont(family, path);
      } catch (error) {
        throw new UsageError(
          `Cannot read the font ${path}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),
  );
}

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

function warnAboutUnusedFonts(
  io: Io,
  rhumb: Rhumb,
  profile: string | StandardProfile | undefined,
  fonts: readonly FontSource[],
): void {
  if (fonts.length === 0) {
    return;
  }

  const chosen =
    typeof profile === "object"
      ? profile
      : rhumb
          .profiles()
          .find((known) =>
            profile === undefined ? known.default : known.id === profile,
          );

  if (chosen === undefined) {
    return;
  }

  const stack = fontFamilies(chosen.font.family);
  const known = new Set(stack.map((family) => family.toLowerCase()));

  for (const { family } of fonts) {
    if (!known.has(family.toLowerCase())) {
      io.writeStderr(
        `Warning: the font "${family}" is not in the font stack of ${chosen.id} (${stack.join(", ")}), so it is not used\n`,
      );
    }
  }
}

async function chooseProfile(
  rhumb: Rhumb,
  id: string | undefined,
  file: string | undefined,
): Promise<string | StandardProfile | undefined> {
  if (id !== undefined && file !== undefined) {
    throw new UsageError("Use either --profile or --profile-file, not both");
  }

  if (file === undefined) {
    if (id !== undefined) {
      try {
        rhumb.profile(id);
      } catch {
        throw new UsageError(
          `No profile "${id}". Known: ${rhumb
            .profiles()
            .map((known) => known.id)
            .join(", ")}`,
        );
      }
    }

    return id;
  }

  const text = await readTextFile(file);
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    throw new UsageError(`${file} is not valid JSON`);
  }

  return rhumb.registerProfile(raw);
}

export async function renderCommand(
  args: readonly string[],
  io: Io,
): Promise<number> {
  const { values, positionals } = parse(args, {
    output: { type: "string", short: "o" },
    format: { type: "string" },
    json: { type: "boolean" },
    profile: { type: "string" },
    "profile-file": { type: "string" },
    preset: { type: "string" },
    ink: { type: "string" },
    fill: { type: "string" },
    hollow: { type: "boolean" },
    background: { type: "string" },
    transparent: { type: "boolean" },
    "label-background": { type: "string" },
    padding: { type: "string" },
    radius: { type: "string" },
    "pixels-per-mm": { type: "string" },
    scale: { type: "string" },
    quality: { type: "string" },
    font: { type: "string", multiple: true },
    "input-encoding": { type: "string" },
    "no-xml-declaration": { type: "boolean" },
    help: { type: "boolean", short: "h" },
  });

  if (values.help === true) {
    io.writeStdout(RENDER_HELP);

    return EXIT_OK;
  }

  if (positionals.length > 1) {
    throw new UsageError("Give one diagram to draw; use a loop for several");
  }

  const output = values.output;
  const format = chooseFormat(values.format, output);
  const isImage = format !== "svg";

  if (isImage && (output === undefined || output === "-") && io.stdoutIsTty) {
    throw new UsageError(
      `An ${format.toUpperCase()} is binary: say where to write it with -o <file>`,
    );
  }

  const source = await readSource(positionals[0], io, values["input-encoding"]);
  const fonts = await loadFonts(values.font ?? []);
  const rhumb = createRhumb({ fonts });
  const options: ImageOptions = {
    profile: await chooseProfile(rhumb, values.profile, values["profile-file"]),
    preset: choosePreset(values.preset),
    ink: values.ink,
    fill: values.fill,
    hollow: values.hollow,
    background: values.background,
    transparent: values.transparent,
    labelBackground: values["label-background"],
    padding: toNumber("padding", values.padding),
    radius: toNumber("radius", values.radius),
    pixelsPerMm: toNumber("pixels-per-mm", values["pixels-per-mm"]),
    scale: chooseScale(toNumber("scale", values.scale)),
    quality: toNumber("quality", values.quality),
  };
  const given = Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as ImageOptions;

  warnAboutUnusedFonts(io, rhumb, options.profile, fonts);

  let data: string | Uint8Array;
  let size: { readonly width: number; readonly height: number };

  if (isImage) {
    const image = await rhumb.renderImage(source.text, {
      ...given,
      format,
    });

    data = await image.bytes();
    size = { width: image.width, height: image.height };
  } else {
    const drawn = await rhumb.render(source.text, given);

    data =
      values["no-xml-declaration"] === true
        ? drawn.svg
        : `${XML_DECLARATION}\n${drawn.svg}`;
    size = drawn.size;
  }

  if (output === undefined || output === "-") {
    io.writeStdout(data);

    return EXIT_OK;
  }

  await writeFile(output, data);

  const width = Math.round(size.width);
  const height = Math.round(size.height);

  io.writeStdout(
    values.json === true
      ? `${JSON.stringify({ output, format, extension: exportExtension(format), width, height })}\n`
      : `Wrote ${output} (${String(width)}x${String(height)}${isImage ? " px" : ""})\n`,
  );

  return EXIT_OK;
}
