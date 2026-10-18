import { type Direction, Side } from "@rhumb/kernel";
import {
  type ProfileSide,
  type SideChoice,
  allowedSides,
} from "@rhumb/profiles";

/** Which side of an open choice is tried first, for each kind of choice. */
export interface SideLean {
  /** First pick when the choice is `side` (left or right). */
  readonly side: "left" | "right";
  /** First pick when the choice is `vertical` (top or bottom). */
  readonly vertical: "top" | "bottom";
}

const PROFILE_SIDES: Readonly<Record<ProfileSide, Side>> = {
  top: Side.Top,
  right: Side.Right,
  bottom: Side.Bottom,
  left: Side.Left,
};

type SideMap = Readonly<Record<Side, Side>>;

const TOP_DOWN: SideMap = {
  [Side.Top]: Side.Top,
  [Side.Right]: Side.Right,
  [Side.Bottom]: Side.Bottom,
  [Side.Left]: Side.Left,
};

const BOTTOM_UP: SideMap = {
  [Side.Top]: Side.Bottom,
  [Side.Right]: Side.Right,
  [Side.Bottom]: Side.Top,
  [Side.Left]: Side.Left,
};

const LEFT_TO_RIGHT: SideMap = {
  [Side.Top]: Side.Left,
  [Side.Right]: Side.Bottom,
  [Side.Bottom]: Side.Right,
  [Side.Left]: Side.Top,
};

const RIGHT_TO_LEFT: SideMap = {
  [Side.Top]: Side.Right,
  [Side.Right]: Side.Bottom,
  [Side.Bottom]: Side.Left,
  [Side.Left]: Side.Top,
};

/**
 * Profiles describe sides for a top-down flow. An orientation translates
 * them to the flow direction of a particular diagram.
 */
export class Orientation {
  private constructor(private readonly mapping: SideMap) {}

  public static of(direction: Direction): Orientation {
    switch (direction) {
      case "TB":
        return new Orientation(TOP_DOWN);
      case "BT":
        return new Orientation(BOTTOM_UP);
      case "LR":
        return new Orientation(LEFT_TO_RIGHT);
      case "RL":
        return new Orientation(RIGHT_TO_LEFT);
    }
  }

  public map(side: Side): Side {
    return this.mapping[side];
  }

  public mapProfileSide(side: ProfileSide): Side {
    return this.map(PROFILE_SIDES[side]);
  }

  /**
   * The sides a profile choice may settle on in this orientation, the one
   * to prefer first. A particular side yields just itself.
   */
  public options(choice: SideChoice, lean: SideLean): readonly Side[] {
    const first = choice === "vertical" ? lean.vertical : lean.side;

    return [...allowedSides(choice)]
      .sort((a, b) => Number(b === first) - Number(a === first))
      .map((side) => this.mapProfileSide(side));
  }
}
