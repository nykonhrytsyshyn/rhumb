import { type JSX, useId, useState } from "react";

import { normalizeHex } from "@rhumb/export";

import { Button } from "@shared/ui/button";
import { ColorPicker } from "@shared/ui/color-picker";
import { Field, FieldLabel } from "@shared/ui/field";
import { Input } from "@shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover";

export interface ExportDialogColorProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
}

export function ExportDialogColor({
  label,
  value,
  onChange,
  disabled = false,
}: ExportDialogColorProps): JSX.Element {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Field data-disabled={disabled} className="gap-1.5">
      <FieldLabel
        htmlFor={id}
        className="text-xs font-normal text-muted-foreground"
      >
        {label}
      </FieldLabel>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={disabled}
                aria-label={label}
                className="shrink-0 rounded-xl p-1"
              />
            }
          >
            <span
              className="size-full rounded-md border"
              style={{ backgroundColor: value }}
            />
          </PopoverTrigger>

          <PopoverContent align="start">
            <ColorPicker
              value={value}
              disabled={disabled}
              onChange={(next) => {
                setDraft(null);
                onChange(next);
              }}
            />
          </PopoverContent>
        </Popover>

        <Input
          id={id}
          value={draft ?? value}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={draft !== null && normalizeHex(draft) === null}
          className="font-mono uppercase"
          onChange={(event) => {
            const text = event.target.value;
            const hex = normalizeHex(text);

            setDraft(text);

            if (hex !== null) {
              onChange(hex);
            }
          }}
          onBlur={() => {
            setDraft(null);
          }}
        />
      </div>
    </Field>
  );
}
