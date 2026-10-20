import { createContext } from "react";

export interface ErrorScreenContextValue {
  readonly code: string;
}

export const ErrorScreenContext = createContext<ErrorScreenContextValue | null>(
  null,
);
