import type { JSX } from "react";

import { Field, FieldError, FieldLabel } from "@shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@shared/ui/input";

import { useProfileForm } from "../model";

export interface ProfileFormNumberProps {
  readonly path: string;
  readonly label: string;
  readonly unit?: string;
  readonly value: string;
  readonly error?: string | undefined;
}

export function ProfileFormNumber({
  path,
  label,
  unit,
  value,
  error,
}: ProfileFormNumberProps): JSX.Element {
  const { disabled, onChange } = useProfileForm();
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
