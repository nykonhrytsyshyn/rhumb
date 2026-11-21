import { type JSX, useId } from "react";

import { Field, FieldLabel } from "@shared/ui/field";
import { Switch } from "@shared/ui/switch";

export interface ExportDialogSwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly disabled?: boolean;
}

export function ExportDialogSwitch({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: ExportDialogSwitchProps): JSX.Element {
  const id = useId();

  return (
    <Field orientation="horizontal" data-disabled={disabled}>
      <Switch
        id={id}
        size="default"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />

      <FieldLabel htmlFor={id} className="text-sm font-normal">
        {label}
      </FieldLabel>
    </Field>
  );
}
