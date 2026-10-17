import { z } from "zod";

import { NODE_KINDS } from "@rhumb/kernel";

import { SIDE_CHOICES, canUseDistinctSides } from "./sideChoice";

const positive = z.number().positive();

/** Where a line's label goes: next to the line, or on it over a backdrop. */
export const LABEL_STYLES = ["beside", "inline"] as const;

export type LabelStyle = (typeof LABEL_STYLES)[number];
const nonnegative = z.number().nonnegative();

const sideSchema = z.enum(SIDE_CHOICES);

const boxSchema = z.object({
  minWidth: positive,
  minHeight: positive,
});

const branchSchema = z.object({
  side: sideSchema,
  /** Edge labels (case-insensitive) that select this branch. */
  labels: z.array(z.string().min(1)),
});

/**
 * Profiles saved before the block was renamed describe it under `loop` with
 * `body` and `back` sides; they are read as `preparation` with `repeat` and
 * `return`.
 */
function migrateLegacyProfile(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || !("loop" in raw)) {
    return raw;
  }

  const { loop, ...rest } = raw as Record<string, unknown>;

  if ("preparation" in rest || typeof loop !== "object" || loop === null) {
    return rest;
  }

  const { body, back, ...kept } = loop as Record<string, unknown>;

  return { ...rest, preparation: { ...kept, repeat: body, return: back } };
}

export const profileSchema = z.preprocess(
  migrateLegacyProfile,
  z
    .object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string().optional(),
      /** The profile selected when the user has not chosen one. */
      default: z.boolean().default(false),
      /** All lengths in the profile are expressed in millimetres. */
      unit: z.literal("mm"),
      grid: positive,
      /** Gap between a block's border and its text. */
      padding: z.number().nonnegative(),
      spacing: z.object({
        node: positive,
        layer: positive,
        /** Free space kept between a line and any block it passes. */
        clearance: nonnegative.default(5),
        /** Distance between parallel lines. */
        line: nonnegative.default(3),
      }),
      line: z.object({
        width: positive,
        thickWidth: positive,
        dash: z.array(positive).min(1),
        /** Placement of the text that labels a line. */
        labelStyle: z.enum(LABEL_STYLES).default("beside"),
        /** Radius of the arch drawn where unrelated lines cross. */
        jump: nonnegative.default(2),
        /** Straight run kept before an arrowhead and after a line leaves a block. */
        stub: nonnegative.default(6),
        arrow: z.object({
          style: z.enum(["open", "filled"]),
          length: nonnegative,
          width: nonnegative,
          /** Whether a line that joins another one ends in its own arrowhead. */
          merge: z.boolean().default(true),
        }),
      }),
      font: z.object({
        family: z.string().min(1),
        size: positive,
        lineHeight: positive,
      }),
      shapes: z.record(z.enum(NODE_KINDS), boxSchema),
      decision: z.object({
        entry: sideSchema,
        yes: branchSchema,
        no: branchSchema,
      }),
      /**
       * Sides of a preparation block (the hexagon) that the flow comes back to:
       * where the flow first enters, where the line to the repeated section
       * leaves, where returning lines enter and where the other lines leave.
       */
      preparation: z.object({
        entry: sideSchema,
        repeat: sideSchema,
        return: sideSchema,
        exit: sideSchema,
      }),
    })
    .refine(
      ({ decision }) =>
        canUseDistinctSides([
          decision.entry,
          decision.yes.side,
          decision.no.side,
        ]),
      {
        message: "Decision entry, yes and no must fit on different sides",
        path: ["decision"],
      },
    )
    .refine(
      ({ preparation }) =>
        canUseDistinctSides([
          preparation.entry,
          preparation.repeat,
          preparation.return,
          preparation.exit,
        ]),
      {
        message:
          "Preparation entry, repeat, return and exit must fit on different sides",
        path: ["preparation"],
      },
    ),
);

export type StandardProfile = z.infer<typeof profileSchema>;
