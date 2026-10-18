import { type JSX, useId } from "react";

import { Field, FieldError, FieldLabel } from "@shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@shared/ui/input";

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
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <InputGroup>
        <InputGroupInput
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
          placeholder={"0"}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupText>{unit ?? null}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      {invalid ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </Field>
  );
}
