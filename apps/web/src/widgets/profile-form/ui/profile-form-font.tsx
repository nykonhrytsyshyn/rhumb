import { Fragment, type JSX } from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@shared/ui/field";
import { Input } from "@shared/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { useProfileForm } from "../model";

export interface ProfileFormFontOption {
  readonly value: string;
  readonly label: string;
  readonly stack: string;
}

export interface ProfileFormFontGroup {
  readonly label: string;
  readonly options: readonly ProfileFormFontOption[];
}

export interface ProfileFormFontProps {
  readonly path: string;
  readonly label: string;
  readonly hint?: string;
  readonly value: string;
  readonly error?: string | undefined;
  readonly groups: readonly ProfileFormFontGroup[];
  readonly selected: string | undefined;
  readonly customLabel: string;
  readonly sample: string;
}

const CUSTOM = "__custom__";

export function ProfileFormFont({
  path,
  label,
  hint,
  value,
  error,
  groups,
  selected,
  customLabel,
  sample,
}: ProfileFormFontProps): JSX.Element {
  const { disabled, onChange } = useProfileForm();
  const invalid = error !== undefined;
  const options = groups.flatMap((group) => group.options);

  return (
    <Field data-invalid={invalid} data-disabled={disabled}>
      <FieldLabel>{label}</FieldLabel>

      <Select
        value={selected ?? CUSTOM}
        disabled={disabled}
        onValueChange={(next) => {
          const chosen = options.find((option) => option.value === next);

          if (chosen !== undefined) {
            onChange(path, chosen.stack);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {(current: string | null) =>
              options.find((option) => option.value === current)?.label ??
              customLabel
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {groups.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 ? <SelectSeparator /> : null}

              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>

                {group.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    style={{ fontFamily: option.stack }}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>

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

      <p
        aria-hidden="true"
        className="truncate rounded-md border border-dashed px-3 py-2 text-lg"
        style={{ fontFamily: value }}
      >
        {sample}
      </p>

      {hint === undefined ? null : <FieldDescription>{hint}</FieldDescription>}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
