import { useContext } from "react";

import {
  ErrorScreenContext,
  type ErrorScreenContextValue,
} from "./error-screen-context";

export function useErrorScreen(): ErrorScreenContextValue {
  const context = useContext(ErrorScreenContext);

  if (context === null) {
    throw new Error("ErrorScreen components must be used within <ErrorScreen>");
  }

  return context;
}
