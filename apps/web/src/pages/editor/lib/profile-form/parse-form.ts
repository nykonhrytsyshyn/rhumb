import { NODE_KINDS } from "@rhumb/kernel";
import { type StandardProfile, profileSchema } from "@rhumb/profiles";

import type { TranslationKey } from "@shared/i18n";

import { FIELD_ALIASES } from "./field-aliases";
import { messageFor } from "./message-for";
import { readField } from "./read-field";
import { toLabels } from "./to-labels";
import { toNumber } from "./to-number";
import type { FormState, ParsedForm } from "./types";

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
