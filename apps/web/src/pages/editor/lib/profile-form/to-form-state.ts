import { NODE_KINDS } from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

import type { FormState, FormTree } from "./types";

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
