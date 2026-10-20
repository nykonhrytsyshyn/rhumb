import { type JSX, type ReactNode, useMemo } from "react";

import { Accordion } from "@shared/ui/accordion";

import { ProfileFormContext } from "../model";

export interface ProfileFormShellProps {
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
  readonly children: ReactNode;
}

export function ProfileFormShell({
  disabled,
  onChange,
  children,
}: ProfileFormShellProps): JSX.Element {
  const value = useMemo(() => ({ disabled, onChange }), [disabled, onChange]);

  return (
    <ProfileFormContext.Provider value={value}>
      <Accordion multiple>{children}</Accordion>
    </ProfileFormContext.Provider>
  );
}
