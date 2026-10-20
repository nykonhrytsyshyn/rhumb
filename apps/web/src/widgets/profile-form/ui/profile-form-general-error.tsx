import type { JSX } from "react";

import { FieldError } from "@shared/ui/field";

export interface ProfileFormGeneralErrorProps {
  readonly message: string;
}

export function ProfileFormGeneralError({
  message,
}: ProfileFormGeneralErrorProps): JSX.Element {
  return (
    <div className="col-span-2">
      <FieldError>{message}</FieldError>
    </div>
  );
}
