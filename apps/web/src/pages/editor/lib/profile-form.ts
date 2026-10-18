import { NODE_KINDS } from "@rhumb/kernel";
import { type StandardProfile, profileSchema } from "@rhumb/profiles";

import type { TranslationKey } from "@shared/i18n";

/** Form values are kept as text so that half-typed input is never lost. */
export interface FormTree {
  [key: string]: string | FormTree;
}

export type FormState = FormTree;

export type FieldErrors = ReadonlyMap<string, TranslationKey>;

export interface ParsedForm {
  /** The profile described by the form, when every field is valid. */
  readonly profile: StandardProfile | undefined;
  /** Error message per field path, for the first problem of each field. */
  readonly errors: FieldErrors;
  /** Problems that concern a group of fields rather than a single one. */
  readonly general: readonly TranslationKey[];
}

const FIELD_ALIASES: Readonly<Record<string, string>> = {
  "line.dash.0": "line.dashLength",
  "line.dash.1": "line.dashGap",
  "line.arrow.length": "line.arrowLength",
  "line.arrow.width": "line.arrowWidth",
  "line.arrow.style": "line.arrowStyle",
  "decision.yes.labels": "decision.yesLabels",
  "decision.no.labels": "decision.noLabels",
  "decision.yes.side": "decision.yes",
  "decision.no.side": "decision.no",
};

export function toFormState(profile: StandardProfile): FormState {
  const shapes: FormTree = {};

  for (const kind of NODE_KINDS) {
    const box = profile.shapes[kind];

    shapes[kind] = {
      minWidth: String(box.minWidth),
      minHeight: String(box.minHeight),
    };
  }

  const [dashLength, dashGap] = profile.line.dash;

  return {
    grid: String(profile.grid),
    padding: String(profile.padding),
    spacing: {
      node: String(profile.spacing.node),
      layer: String(profile.spacing.layer),
      clearance: String(profile.spacing.clearance),
      line: String(profile.spacing.line),
    },
    line: {
      width: String(profile.line.width),
      thickWidth: String(profile.line.thickWidth),
      dashLength: String(dashLength ?? ""),
      dashGap: String(dashGap ?? dashLength ?? ""),
      labelStyle: profile.line.labelStyle,
      jump: String(profile.line.jump),
      stub: String(profile.line.stub),
      arrowStyle: profile.line.arrow.style,
      arrowLength: String(profile.line.arrow.length),
      arrowWidth: String(profile.line.arrow.width),
      arrowMerge: String(profile.line.arrow.merge),
    },
    font: {
      family: profile.font.family,
      size: String(profile.font.size),
      lineHeight: String(profile.font.lineHeight),
    },
    shapes,
    decision: {
      entry: profile.decision.entry,
      yes: profile.decision.yes.side,
      no: profile.decision.no.side,
      yesLabels: profile.decision.yes.labels.join(", "),
      noLabels: profile.decision.no.labels.join(", "),
    },
    preparation: {
      entry: profile.preparation.entry,
      repeat: profile.preparation.repeat,
      return: profile.preparation.return,
      exit: profile.preparation.exit,
    },
  };
}

export function readField(state: FormState, path: string): string {
  let node: string | FormTree | undefined = state;

  for (const part of path.split(".")) {
    node = typeof node === "object" ? node[part] : undefined;
  }

  return typeof node === "string" ? node : "";
}

/** Returns a copy of the state with the field at `path` replaced. */
export function writeField(
  state: FormState,
  path: string,
  value: string,
): FormState {
  const [head, ...rest] = path.split(".");

  if (head === undefined) {
    return state;
  }

  if (rest.length === 0) {
    return { ...state, [head]: value };
  }

  const child = state[head];

  return {
    ...state,
    [head]: writeField(
      typeof child === "object" ? child : {},
      rest.join("."),
      value,
    ),
  };
}

function toNumber(text: string): number {
  const trimmed = text.trim().replace(",", ".");

  return trimmed === "" ? Number.NaN : Number(trimmed);
}

function toLabels(text: string): string[] {
  return text
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label !== "");
}

function messageFor(issue: {
  readonly code: string;
  readonly origin?: unknown;
  readonly inclusive?: unknown;
}): TranslationKey {
  if (issue.code === "invalid_type") {
    return "editor.config.errors.number";
  }

  if (issue.code === "too_small" && issue.origin === "string") {
    return "editor.config.errors.required";
  }

  if (issue.code === "too_small") {
    return issue.inclusive === true
      ? "editor.config.errors.notNegative"
      : "editor.config.errors.positive";
  }

  return "editor.config.errors.invalid";
}

/** Turns the form text into a profile, or says what is wrong with it. */
export function parseForm(state: FormState, base: StandardProfile): ParsedForm {
  const number = (path: string): number => toNumber(readField(state, path));
  const text = (path: string): string => readField(state, path);

  const shapes: Record<string, { minWidth: number; minHeight: number }> = {};

  for (const kind of NODE_KINDS) {
    shapes[kind] = {
      minWidth: number(`shapes.${kind}.minWidth`),
      minHeight: number(`shapes.${kind}.minHeight`),
    };
  }

  const result = profileSchema.safeParse({
    id: base.id,
    title: base.title,
    description: base.description,
    default: base.default,
    unit: "mm",
    grid: number("grid"),
    padding: number("padding"),
    spacing: {
      node: number("spacing.node"),
      layer: number("spacing.layer"),
      clearance: number("spacing.clearance"),
      line: number("spacing.line"),
    },
    line: {
      width: number("line.width"),
      thickWidth: number("line.thickWidth"),
      dash: [number("line.dashLength"), number("line.dashGap")],
      labelStyle: text("line.labelStyle"),
      jump: number("line.jump"),
      stub: number("line.stub"),
      arrow: {
        style: text("line.arrowStyle"),
        length: number("line.arrowLength"),
        width: number("line.arrowWidth"),
        merge: text("line.arrowMerge") === "true",
      },
    },
    font: {
      family: text("font.family"),
      size: number("font.size"),
      lineHeight: number("font.lineHeight"),
    },
    shapes,
    decision: {
      entry: text("decision.entry"),
      yes: {
        side: text("decision.yes"),
        labels: toLabels(text("decision.yesLabels")),
      },
      no: {
        side: text("decision.no"),
        labels: toLabels(text("decision.noLabels")),
      },
    },
    preparation: {
      entry: text("preparation.entry"),
      repeat: text("preparation.repeat"),
      return: text("preparation.return"),
      exit: text("preparation.exit"),
    },
  });

  if (result.success) {
    return { profile: result.data, errors: new Map(), general: [] };
  }

  const errors = new Map<string, TranslationKey>();
  const general: TranslationKey[] = [];

  for (const issue of result.error.issues) {
    const joined = issue.path.map(String).join(".");

    if (joined === "decision" || joined === "preparation") {
      general.push(
        joined === "decision"
          ? "editor.config.errors.decisionSides"
          : "editor.config.errors.preparationSides",
      );
      continue;
    }

    const field = FIELD_ALIASES[joined] ?? joined;

    if (!errors.has(field)) {
      errors.set(field, messageFor(issue));
    }
  }

  return { profile: undefined, errors, general };
}
