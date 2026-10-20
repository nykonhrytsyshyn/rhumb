import { createContext } from "react";

export interface ProfileFormContextValue {
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

export const ProfileFormContext = createContext<ProfileFormContextValue | null>(
  null,
);
