import type { JSX } from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@shared/ui/field";
import { Input } from "@shared/ui/input";

import { useProfileForm } from "../model";

export interface ProfileFormTextProps {
  readonly path: string;
  readonly label: string;
  readonly hint?: string;
  readonly value: string;
  readonly error?: string | undefined;
}

export function ProfileFormText({
  path,
  label,
  hint,
  value,
  error,
}: ProfileFormTextProps): JSX.Element {
  const { disabled, onChange } = useProfileForm();
  const invalid = error !== undefined;

  return (
    <Field data-invalid={invalid} data-disabled={disabled}>
      <FieldLabel>{label}</FieldLabel>

      <Input
        autoComplete="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => {
          onChange(path, event.target.value);
        }}
      />

      {hint === undefined ? null : <FieldDescription>{hint}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
