import type { JSX } from "react";

import { NODE_KINDS } from "@rhumb/kernel";
import { LABEL_STYLES, SIDE_CHOICES } from "@rhumb/profiles";

import { ProfileForm } from "@widgets/profile-form";

import type { TranslationKey } from "@shared/i18n";
import { useT } from "@shared/i18n";

import { BLOCK_NAMES } from "../../../config/block-names";
import { isGroupInvalid } from "../../../lib/is-group-invalid";
import { type FormState, readField } from "../../../lib/profile-form";
import type { ParsedForm } from "../../../lib/profile-form";

export interface ProfileFieldsProps {
  readonly values: FormState;
  readonly parsed: ParsedForm;
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

export function ProfileFields({
  values,
  parsed,
  disabled,
  onChange,
}: ProfileFieldsProps): JSX.Element {
  const t = useT();
  const unit = t("editor.config.unit");

  const errorOf = (path: string): string | undefined => {
    const key = parsed.errors.get(path);

    return key === undefined ? undefined : t(key);
  };

  const number = (path: string, label: TranslationKey, withUnit = true) => (
    <ProfileForm.Number
      key={path}
      path={path}
      label={t(label)}
      {...(withUnit ? { unit } : {})}
      value={readField(values, path)}
      error={errorOf(path)}
    />
  );

  const sides = SIDE_CHOICES.map((side) => ({
    value: side,
    label: t(`editor.config.sides.${side}`),
  }));

  const choice = (path: string, label: TranslationKey) => (
    <ProfileForm.Choice
      key={path}
      path={path}
      label={t(label)}
      value={readField(values, path)}
      options={sides}
    />
  );

  const generalError = (key: TranslationKey) =>
    parsed.general.includes(key) ? (
      <ProfileForm.GeneralError key={key} message={t(key)} />
    ) : null;

  return (
    <ProfileForm disabled={disabled} onChange={onChange}>
      <ProfileForm.Group
        id="page"
        title={t("editor.config.groups.page")}
        invalid={isGroupInvalid("page", parsed, undefined)}
      >
        {[
          number("grid", "editor.config.fields.grid"),
          number("padding", "editor.config.fields.padding"),
          number("spacing.node", "editor.config.fields.nodeSpacing"),
          number("spacing.layer", "editor.config.fields.layerSpacing"),
          number("spacing.clearance", "editor.config.fields.clearance"),
          number("spacing.line", "editor.config.fields.lineSpacing"),
        ]}
      </ProfileForm.Group>

      <ProfileForm.Group
        id="lines"
        title={t("editor.config.groups.lines")}
        invalid={isGroupInvalid("lines", parsed, undefined)}
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
          <ProfileForm.Choice
            key="line.arrowStyle"
            path="line.arrowStyle"
            label={t("editor.config.fields.arrowStyle")}
            value={readField(values, "line.arrowStyle")}
            options={[
              { value: "open", label: t("editor.config.arrow.open") },
              { value: "filled", label: t("editor.config.arrow.filled") },
            ]}
          />,
          <ProfileForm.Choice
            key="line.arrowMerge"
            path="line.arrowMerge"
            label={t("editor.config.fields.arrowMerge")}
            value={readField(values, "line.arrowMerge")}
            options={[
              { value: "true", label: t("editor.config.arrowMerge.true") },
              { value: "false", label: t("editor.config.arrowMerge.false") },
            ]}
          />,
          <ProfileForm.Choice
            key="line.labelStyle"
            path="line.labelStyle"
            label={t("editor.config.fields.labelStyle")}
            value={readField(values, "line.labelStyle")}
            options={LABEL_STYLES.map((style) => ({
              value: style,
              label: t(`editor.config.labelStyleOptions.${style}`),
            }))}
          />,
        ]}
      </ProfileForm.Group>

      <ProfileForm.Group
        id="text"
        title={t("editor.config.groups.text")}
        invalid={isGroupInvalid("text", parsed, undefined)}
      >
        {[
          <ProfileForm.Wide key="font.family">
            <ProfileForm.Text
              path="font.family"
              label={t("editor.config.fields.fontFamily")}
              value={readField(values, "font.family")}
              error={errorOf("font.family")}
            />
          </ProfileForm.Wide>,
          number("font.size", "editor.config.fields.fontSize"),
          number("font.lineHeight", "editor.config.fields.lineHeight", false),
        ]}
      </ProfileForm.Group>

      <ProfileForm.Group
        id="blocks"
        title={t("editor.config.groups.blocks")}
        invalid={isGroupInvalid("blocks", parsed, undefined)}
      >
        {NODE_KINDS.map((kind) => (
          <ProfileForm.Fieldset key={kind} title={t(BLOCK_NAMES[kind])}>
            {number(`shapes.${kind}.minWidth`, "editor.config.fields.minWidth")}
            {number(
              `shapes.${kind}.minHeight`,
              "editor.config.fields.minHeight",
            )}
          </ProfileForm.Fieldset>
        ))}
      </ProfileForm.Group>

      <ProfileForm.Group
        id="branches"
        title={t("editor.config.groups.branches")}
        invalid={isGroupInvalid(
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
          <ProfileForm.Wide key="decision.labels" stacked>
            <ProfileForm.Text
              path="decision.yesLabels"
              label={t("editor.config.fields.yesLabels")}
              hint={t("editor.config.fields.labelsHint")}
              value={readField(values, "decision.yesLabels")}
              error={errorOf("decision.yesLabels")}
            />
            <ProfileForm.Text
              path="decision.noLabels"
              label={t("editor.config.fields.noLabels")}
              hint={t("editor.config.fields.labelsHint")}
              value={readField(values, "decision.noLabels")}
              error={errorOf("decision.noLabels")}
            />
          </ProfileForm.Wide>,
        ]}
      </ProfileForm.Group>

      <ProfileForm.Group
        id="preparation"
        title={t("editor.config.groups.preparation")}
        invalid={isGroupInvalid(
          "preparation",
          parsed,
          "editor.config.errors.preparationSides",
        )}
      >
        {[
          generalError("editor.config.errors.preparationSides"),
          choice("preparation.entry", "editor.config.fields.entry"),
          choice("preparation.repeat", "editor.config.fields.repeat"),
          choice("preparation.return", "editor.config.fields.return"),
          choice("preparation.exit", "editor.config.fields.exit"),
        ]}
      </ProfileForm.Group>
    </ProfileForm>
  );
}
