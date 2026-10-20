import { type ComponentType, lazy } from "react";

export const ERROR_SCENES: readonly ComponentType[] = [
  lazy(() =>
    import("./error-stairs-scene").then((module) => ({
      default: module.ErrorStairsScene,
    })),
  ),
];
