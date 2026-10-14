import { type JSX, useId } from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@shared/ui/field";
import { Input } from "@shared/ui/input";

export interface TextFieldProps {
  readonly path: string;
  readonly label: string;
  readonly hint?: string;
  readonly value: string;
  readonly error?: string | undefined;
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

export function TextField({
  path,
  label,
  hint,
  value,
  error,
  disabled,
  onChange,
}: TextFieldProps): JSX.Element {
  const id = useId();
  const invalid = error !== undefined;

  return (
    <Field data-invalid={invalid} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <Input
        id={id}
        autoComplete="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          onChange(path, event.target.value);
        }}
      />

      {hint === undefined ? null : <FieldDescription>{hint}</FieldDescription>}
      {invalid ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}
