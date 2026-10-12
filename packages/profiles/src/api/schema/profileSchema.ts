import { z } from "zod";

import { NODE_KINDS } from "@rhumb/kernel";

const positive = z.number().positive();
const nonnegative = z.number().nonnegative();

const sideSchema = z.enum(["top", "right", "bottom", "left"]);

const boxSchema = z.object({
  minWidth: positive,
  minHeight: positive,
});

const branchSchema = z.object({
  side: sideSchema,
  /** Edge labels (case-insensitive) that select this branch. */
  labels: z.array(z.string().min(1)),
});

export const profileSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
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
      /** Radius of the arch drawn where unrelated lines cross. */
      jump: nonnegative.default(2),
      /** Straight run kept before an arrowhead and after a line leaves a block. */
      stub: nonnegative.default(6),
      arrow: z.object({
        style: z.enum(["open", "filled"]),
        length: nonnegative,
        width: nonnegative,
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
    /** Sides of a loop header block (the hexagon): where the flow enters,
     * where the body starts, where the body returns and where the loop exits. */
    loop: z.object({
      entry: sideSchema,
      body: sideSchema,
      back: sideSchema,
      exit: sideSchema,
    }),
  })
  .refine(
    ({ decision }) =>
      new Set([decision.entry, decision.yes.side, decision.no.side]).size === 3,
    {
      message: "Decision entry, yes and no sides must all differ",
      path: ["decision"],
    },
  )
  .refine(
    ({ loop }) =>
      new Set([loop.entry, loop.body, loop.back, loop.exit]).size === 4,
    {
      message: "Loop entry, body, back and exit sides must all differ",
      path: ["loop"],
    },
  );

export type StandardProfile = z.infer<typeof profileSchema>;
