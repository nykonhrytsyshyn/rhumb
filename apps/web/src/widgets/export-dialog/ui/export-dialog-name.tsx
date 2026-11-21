import { type JSX, useId } from "react";

import { Field, FieldLabel } from "@shared/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@shared/ui/input";

export interface ExportDialogNameProps {
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly extension: string;
  readonly onChange: (value: string) => void;
}

export function ExportDialogName({
  label,
  value,
  placeholder,
  extension,
  onChange,
}: ExportDialogNameProps): JSX.Element {
  const id = useId();

  return (
    <Field className="gap-1.5">
      <FieldLabel
        htmlFor={id}
        className="text-xs font-normal text-muted-foreground"
      >
        {label}
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={id}
          value={value}
          maxLength={80}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupText>.{extension}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
