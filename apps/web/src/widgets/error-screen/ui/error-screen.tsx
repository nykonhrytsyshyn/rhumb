import type { JSX } from "react";

import { ErrorScreenAction } from "./error-screen-action";
import { ErrorScreenBanner } from "./error-screen-banner";
import { ErrorScreenCanvas } from "./error-screen-canvas";
import { ErrorScreenScene } from "./error-screen-scene";
import {
  ErrorScreenShell,
  type ErrorScreenShellProps,
} from "./error-screen-shell";
import { ErrorScreenTitle } from "./error-screen-title";

interface ErrorScreenComponent {
  (props: ErrorScreenShellProps): JSX.Element;
  Canvas: typeof ErrorScreenCanvas;
  Scene: typeof ErrorScreenScene;
  Banner: typeof ErrorScreenBanner;
  Title: typeof ErrorScreenTitle;
  Action: typeof ErrorScreenAction;
}

export const ErrorScreen: ErrorScreenComponent = Object.assign(
  ErrorScreenShell,
  {
    Canvas: ErrorScreenCanvas,
    Scene: ErrorScreenScene,
    Banner: ErrorScreenBanner,
    Title: ErrorScreenTitle,
    Action: ErrorScreenAction,
  },
);
