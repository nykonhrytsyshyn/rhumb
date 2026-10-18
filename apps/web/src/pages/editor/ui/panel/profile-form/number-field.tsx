import { type JSX } from "react";

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
  const invalid = error !== undefined;

  return (
    <Field data-disabled={disabled}>
      <FieldLabel>{label}</FieldLabel>

      <InputGroup>
        <InputGroupInput
          inputMode="decimal"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-invalid={invalid}
          onChange={(event) => {
            onChange(path, event.target.value);
          }}
          placeholder={"0"}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupText>{unit ?? null}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      <FieldError>{error}</FieldError>
    </Field>
  );
}
