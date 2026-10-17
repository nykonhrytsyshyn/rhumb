/** The four sides of a block as a profile names them (for a top-down flow). */
export const PROFILE_SIDES = ["top", "right", "bottom", "left"] as const;

export type ProfileSide = (typeof PROFILE_SIDES)[number];

/**
 * What a profile may ask for: one particular side, or an open choice that
 * the renderer settles per diagram so that lines stay short:
 * - `side`: left or right,
 * - `vertical`: top or bottom.
 */
export const SIDE_CHOICES = [...PROFILE_SIDES, "side", "vertical"] as const;

export type SideChoice = (typeof SIDE_CHOICES)[number];

/** The sides a choice may settle on. */
export function allowedSides(choice: SideChoice): readonly ProfileSide[] {
  switch (choice) {
    case "side":
      return ["left", "right"];
    case "vertical":
      return ["top", "bottom"];
    default:
      return [choice];
  }
}

/**
 * True when every choice can be given a side of its own, so that two roles
 * never end up on the same side of a block.
 */
export function canUseDistinctSides(choices: readonly SideChoice[]): boolean {
  const taken = new Set<ProfileSide>();

  const place = (index: number): boolean => {
    const choice = choices[index];

    if (choice === undefined) {
      return true;
    }

    return allowedSides(choice).some((side) => {
      if (taken.has(side)) {
        return false;
      }

      taken.add(side);

      const fits = place(index + 1);

      taken.delete(side);

      return fits;
    });
  };

  return place(0);
}
