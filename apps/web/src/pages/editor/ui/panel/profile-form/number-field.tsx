import { type JSX, useId } from "react";

import { Field, FieldError, FieldLabel } from "@shared/ui/field";
import { Input } from "@shared/ui/input";

export interface NumberFieldProps {
  readonly path: string;
  readonly label: string;
  readonly unit?: string;
  readonly value: string;
  readonly error?: string | undefined;
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

export function NumberField({
  path,
  label,
  unit,
  value,
  error,
  disabled,
  onChange,
}: NumberFieldProps): JSX.Element {
  const id = useId();
  const invalid = error !== undefined;

  return (
    <Field data-invalid={invalid} data-disabled={disabled}>
      <FieldLabel htmlFor={id}>
        {label}
        {unit === undefined ? null : (
          <span className="font-normal text-muted-foreground">· {unit}</span>
        )}
      </FieldLabel>

      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          onChange(path, event.target.value);
        }}
      />

      {invalid ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}
