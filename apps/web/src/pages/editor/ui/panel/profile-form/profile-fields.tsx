import type { JSX, ReactNode } from "react";

import { NODE_KINDS, type NodeKind } from "@rhumb/kernel";
import { LABEL_STYLES } from "@rhumb/profiles";

import { type TranslateFn, useT } from "@shared/i18n";
import type { TranslationKey } from "@shared/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shared/ui/accordion";
import { FieldError, FieldLegend, FieldSet } from "@shared/ui/field";

import { type FormState, readField } from "../../../lib/profile-form";
import type { ParsedForm } from "../../../lib/profile-form";
import { ChoiceField } from "./choice-field";
import { NumberField } from "./number-field";
import { TextField } from "./text-field";

export interface ProfileFieldsProps {
  readonly values: FormState;
  readonly parsed: ParsedForm;
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

const SIDES = ["top", "right", "bottom", "left"] as const;

const BLOCK_NAMES: Readonly<Record<NodeKind, TranslationKey>> = {
  process: "docs.blocks.process",
  terminator: "docs.blocks.terminator",
  decision: "docs.blocks.decision",
  io: "docs.blocks.io",
  preparation: "docs.blocks.preparation",
  predefinedProcess: "docs.blocks.predefined",
  connector: "docs.blocks.connector",
};

/** The form paths that belong to each group, to flag groups with problems. */
const GROUP_PATHS: Readonly<Record<string, readonly string[]>> = {
  page: ["grid", "padding", "spacing."],
  lines: ["line."],
  text: ["font."],
  blocks: ["shapes."],
  branches: ["decision."],
  loops: ["loop."],
};

function groupInvalid(
  group: string,
  parsed: ParsedForm,
  generalKey: TranslationKey | undefined,
): boolean {
  const prefixes = GROUP_PATHS[group] ?? [];
  const fieldProblem = [...parsed.errors.keys()].some((path) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(prefix)),
  );

  return (
    fieldProblem ||
    (generalKey !== undefined && parsed.general.includes(generalKey))
  );
}

interface GroupProps {
  readonly id: string;
  readonly title: string;
  readonly invalid: boolean;
  readonly children: ReactNode;
}

function Group({ id, title, invalid, children }: GroupProps): JSX.Element {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <span className="flex items-center gap-2">
          {title}
          {invalid ? (
            <span
              role="img"
              aria-label="!"
              className="size-2 rounded-full bg-destructive"
            />
          ) : null}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ProfileFields({
  values,
  parsed,
  disabled,
  onChange,
}: ProfileFieldsProps): JSX.Element {
  const t: TranslateFn = useT();
  const unit = t("editor.config.unit");

  const number = (path: string, label: TranslationKey, withUnit = true) => (
    <NumberField
      key={path}
      path={path}
      label={t(label)}
      {...(withUnit ? { unit } : {})}
      value={readField(values, path)}
      error={errorOf(path)}
      disabled={disabled}
      onChange={onChange}
    />
  );

  const errorOf = (path: string): string | undefined => {
    const key = parsed.errors.get(path);

    return key === undefined ? undefined : t(key);
  };

  const sides = SIDES.map((side) => ({
    value: side,
    label: t(`editor.config.sides.${side}`),
  }));

  const choice = (path: string, label: TranslationKey) => (
    <ChoiceField
      key={path}
      path={path}
      label={t(label)}
      value={readField(values, path)}
      options={sides}
      disabled={disabled}
      onChange={onChange}
    />
  );

  const generalError = (key: TranslationKey) =>
    parsed.general.includes(key) ? (
      <div key={key} className="col-span-2">
        <FieldError>{t(key)}</FieldError>
      </div>
    ) : null;

  return (
    <Accordion multiple defaultValue={["page"]}>
      <Group
        id="page"
        title={t("editor.config.groups.page")}
        invalid={groupInvalid("page", parsed, undefined)}
      >
        {[
          number("grid", "editor.config.fields.grid"),
          number("padding", "editor.config.fields.padding"),
          number("spacing.node", "editor.config.fields.nodeSpacing"),
          number("spacing.layer", "editor.config.fields.layerSpacing"),
          number("spacing.clearance", "editor.config.fields.clearance"),
          number("spacing.line", "editor.config.fields.lineSpacing"),
        ]}
      </Group>

      <Group
        id="lines"
        title={t("editor.config.groups.lines")}
        invalid={groupInvalid("lines", parsed, undefined)}
      >
        {[
          number("line.width", "editor.config.fields.lineWidth"),
          number("line.thickWidth", "editor.config.fields.thickWidth"),
          number("line.dashLength", "editor.config.fields.dashLength"),
          number("line.dashGap", "editor.config.fields.dashGap"),
          number("line.jump", "editor.config.fields.jump"),
          number("line.stub", "editor.config.fields.stub"),
          number("line.arrowLength", "editor.config.fields.arrowLength"),
          number("line.arrowWidth", "editor.config.fields.arrowWidth"),
          <ChoiceField
            key="line.arrowStyle"
            path="line.arrowStyle"
            label={t("editor.config.fields.arrowStyle")}
            value={readField(values, "line.arrowStyle")}
            options={[
              { value: "open", label: t("editor.config.arrow.open") },
              { value: "filled", label: t("editor.config.arrow.filled") },
            ]}
            disabled={disabled}
            onChange={onChange}
          />,
          <ChoiceField
            key="line.labelStyle"
            path="line.labelStyle"
            label={t("editor.config.fields.labelStyle")}
            value={readField(values, "line.labelStyle")}
            options={LABEL_STYLES.map((style) => ({
              value: style,
              label: t(`editor.config.labelStyleOptions.${style}`),
            }))}
            disabled={disabled}
            onChange={onChange}
          />,
        ]}
      </Group>

      <Group
        id="text"
        title={t("editor.config.groups.text")}
        invalid={groupInvalid("text", parsed, undefined)}
      >
        {[
          <div key="font.family" className="col-span-2">
            <TextField
              path="font.family"
              label={t("editor.config.fields.fontFamily")}
              value={readField(values, "font.family")}
              error={errorOf("font.family")}
              disabled={disabled}
              onChange={onChange}
            />
          </div>,
          number("font.size", "editor.config.fields.fontSize"),
          number("font.lineHeight", "editor.config.fields.lineHeight", false),
        ]}
      </Group>

      <Group
        id="blocks"
        title={t("editor.config.groups.blocks")}
        invalid={groupInvalid("blocks", parsed, undefined)}
      >
        {NODE_KINDS.map((kind) => (
          <FieldSet key={kind} className="col-span-2">
            <FieldLegend variant="label">{t(BLOCK_NAMES[kind])}</FieldLegend>

            <div className="grid grid-cols-2 gap-3">
              {number(
                `shapes.${kind}.minWidth`,
                "editor.config.fields.minWidth",
              )}
              {number(
                `shapes.${kind}.minHeight`,
                "editor.config.fields.minHeight",
              )}
            </div>
          </FieldSet>
        ))}
      </Group>

      <Group
        id="branches"
        title={t("editor.config.groups.branches")}
        invalid={groupInvalid(
          "branches",
          parsed,
          "editor.config.errors.decisionSides",
        )}
      >
        {[
          generalError("editor.config.errors.decisionSides"),
          choice("decision.entry", "editor.config.fields.entry"),
          choice("decision.yes", "editor.config.fields.yes"),
          choice("decision.no", "editor.config.fields.no"),
          <div key="decision.labels" className="col-span-2 grid gap-3">
            <TextField
              path="decision.yesLabels"
              label={t("editor.config.fields.yesLabels")}
              hint={t("editor.config.fields.labelsHint")}
              value={readField(values, "decision.yesLabels")}
              error={errorOf("decision.yesLabels")}
              disabled={disabled}
              onChange={onChange}
            />
            <TextField
              path="decision.noLabels"
              label={t("editor.config.fields.noLabels")}
              hint={t("editor.config.fields.labelsHint")}
              value={readField(values, "decision.noLabels")}
              error={errorOf("decision.noLabels")}
              disabled={disabled}
              onChange={onChange}
            />
          </div>,
        ]}
      </Group>

      <Group
        id="loops"
        title={t("editor.config.groups.loops")}
        invalid={groupInvalid(
          "loops",
          parsed,
          "editor.config.errors.loopSides",
        )}
      >
        {[
          generalError("editor.config.errors.loopSides"),
          choice("loop.entry", "editor.config.fields.entry"),
          choice("loop.body", "editor.config.fields.body"),
          choice("loop.back", "editor.config.fields.back"),
          choice("loop.exit", "editor.config.fields.exit"),
        ]}
      </Group>
    </Accordion>
  );
}
