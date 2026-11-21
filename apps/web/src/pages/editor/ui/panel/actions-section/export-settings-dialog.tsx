import type { JSX } from "react";

import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconRestore,
} from "@tabler/icons-react";

import {
  EXPORT_FORMATS,
  EXPORT_FORMAT_LABELS,
  EXPORT_PRESETS,
  EXPORT_PRESET_IDS,
  EXPORT_SCALES,
  PADDING_RANGE,
  QUALITY_RANGE,
  RADIUS_RANGE,
  exceedsRasterLimit,
  exportDimensions,
  exportExtension,
  matchPreset,
  toAppearance,
} from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { ExportDialog } from "@widgets/export-dialog";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Spinner } from "@shared/ui/spinner";

import type { RenderState } from "../../../model/diagram";
import type { ExportActions } from "../../../model/use-export-actions";
import type { ExportSettingsModel } from "../../../model/use-export-settings";

export interface ExportSettingsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly model: ExportSettingsModel;
  readonly actions: ExportActions;
  readonly profile: StandardProfile | undefined;
  readonly rendered: RenderState;
}

export function ExportSettingsDialog({
  open,
  onOpenChange,
  model,
  actions,
  profile,
  rendered,
}: ExportSettingsDialogProps): JSX.Element {
  const t = useT();
  const { settings, change, applyPreset, reset } = model;
  const { size } = rendered;

  const raster = settings.format !== "svg";
  const lossy = settings.format === "jpeg" || settings.format === "webp";
  const tooLarge = size !== null && exceedsRasterLimit(size, settings);
  const blocked = profile === undefined || actions.busy !== null;
  const appearance = toAppearance(settings);
  const pixels = size === null ? null : exportDimensions(size, settings);
  const matched = matchPreset(settings);
  const copyKind = raster ? "copy-image" : "copy-svg";
  const copied = actions.copied === copyKind;

  const presets = EXPORT_PRESET_IDS.map((id) => ({
    id,
    label: t(`editor.export.presets.${id}`),
    ...EXPORT_PRESETS[id],
  }));

  return (
    <ExportDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("editor.export.title")}
      closeLabel={t("editor.export.close")}
    >
      {/* Body */}
      <ExportDialog.Body>
        {/* Preview section */}
        <ExportDialog.Preview
          svg={rendered.svg}
          size={size}
          pending={rendered.pending}
          empty={t("editor.export.empty")}
          padding={settings.padding}
          radius={settings.radius}
          background={settings.transparent ? null : settings.background}
          ink={appearance.ink}
          fill={appearance.fill}
          labelBackground={appearance.labelBackground}
          format={
            raster
              ? `${EXPORT_FORMAT_LABELS[settings.format]} · ${String(settings.scale)}×`
              : EXPORT_FORMAT_LABELS[settings.format]
          }
          dimensions={
            pixels === null
              ? "—"
              : t("editor.export.size", {
                  width: pixels.width,
                  height: pixels.height,
                })
          }
          warning={tooLarge ? t("editor.export.tooLarge") : null}
          labels={{
            zoomIn: t("common.canvas.zoomIn"),
            zoomOut: t("common.canvas.zoomOut"),
            fit: t("common.canvas.fit"),
          }}
        />

        {/* Settings section */}
        <ExportDialog.Settings>
          {/* Presets section */}
          <ExportDialog.Section
            title={t("editor.export.sections.look")}
            hint={
              matched === null
                ? t("editor.export.presets.custom")
                : t(`editor.export.presets.${matched}`)
            }
          >
            <ExportDialog.Presets
              label={t("editor.export.presets.label")}
              presets={presets}
              value={matched}
              onChange={applyPreset}
            />
          </ExportDialog.Section>

          {/* Colors section */}
          <ExportDialog.Section title={t("editor.export.sections.colors")}>
            <ExportDialog.Color
              label={t("editor.export.ink")}
              value={settings.ink}
              onChange={(ink) => {
                change({ ink });
              }}
            />

            <ExportDialog.Switch
              label={t("editor.export.hollow")}
              checked={settings.hollow}
              onCheckedChange={(hollow) => {
                change({ hollow });
              }}
            />

            <ExportDialog.Color
              label={t("editor.export.fill")}
              value={settings.fill}
              disabled={settings.hollow}
              onChange={(fill) => {
                change({ fill });
              }}
            />

            <ExportDialog.Switch
              label={t("editor.export.transparent")}
              checked={settings.transparent}
              onCheckedChange={(transparent) => {
                change({ transparent });
              }}
            />

            <ExportDialog.Color
              label={t("editor.export.background")}
              value={settings.background}
              disabled={settings.transparent}
              onChange={(background) => {
                change({ background });
              }}
            />
          </ExportDialog.Section>

          {/* Layout section */}
          <ExportDialog.Section title={t("editor.export.sections.layout")}>
            <ExportDialog.Slider
              label={t("editor.export.padding")}
              value={settings.padding}
              min={PADDING_RANGE.min}
              max={PADDING_RANGE.max}
              step={PADDING_RANGE.step}
              valueText={`${String(settings.padding)} px`}
              onChange={(padding) => {
                change({ padding });
              }}
            />

            <ExportDialog.Slider
              label={t("editor.export.radius")}
              value={settings.radius}
              min={RADIUS_RANGE.min}
              max={RADIUS_RANGE.max}
              step={RADIUS_RANGE.step}
              valueText={`${String(settings.radius)} px`}
              disabled={settings.transparent}
              onChange={(radius) => {
                change({ radius });
              }}
            />
          </ExportDialog.Section>

          {/* Image section */}
          <ExportDialog.Section title={t("editor.export.sections.image")}>
            <ExportDialog.Choice
              label={t("editor.export.format")}
              value={settings.format}
              options={EXPORT_FORMATS.map((format) => ({
                value: format,
                label: EXPORT_FORMAT_LABELS[format],
              }))}
              onChange={(format) => {
                change({ format });
              }}
            />

            <ExportDialog.Choice
              label={t("editor.export.scale")}
              value={String(settings.scale)}
              disabled={!raster}
              options={EXPORT_SCALES.map((scale) => ({
                value: String(scale),
                label: `${String(scale)}×`,
              }))}
              onChange={(value) => {
                const scale = EXPORT_SCALES.find(
                  (item) => String(item) === value,
                );

                if (scale !== undefined) {
                  change({ scale });
                }
              }}
            />

            {lossy ? (
              <ExportDialog.Slider
                label={t("editor.export.quality")}
                value={settings.quality}
                min={QUALITY_RANGE.min}
                max={QUALITY_RANGE.max}
                step={QUALITY_RANGE.step}
                valueText={`${String(settings.quality)}%`}
                onChange={(quality) => {
                  change({ quality });
                }}
              />
            ) : null}
          </ExportDialog.Section>

          {/* File section */}
          <ExportDialog.Section title={t("editor.export.sections.file")}>
            <ExportDialog.Name
              label={t("editor.export.fileName")}
              value={settings.fileName}
              placeholder={profile?.id ?? ""}
              extension={exportExtension(settings.format)}
              onChange={(fileName) => {
                change({ fileName });
              }}
            />
          </ExportDialog.Section>
        </ExportDialog.Settings>
      </ExportDialog.Body>

      {/* Footer */}
      <ExportDialog.Footer>
        {/* Error banner (mobile) */}
        {actions.failure === null ? null : (
          <p
            role="alert"
            className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs whitespace-pre-wrap text-destructive sm:hidden"
          >
            <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
            {actions.failure}
          </p>
        )}

        {/* Reset (desktop) and error banner (desktop) */}
        <div className="hidden min-w-0 shrink-0 items-stretch sm:flex">
          {/* Reset (desktop) button */}
          <Button
            variant="ghost"
            onClick={reset}
            className="h-12 rounded-none border-r border-border px-5"
          >
            <IconRestore className="shrink-0" /> {t("editor.export.reset")}
          </Button>

          {/* Error message */}
          {actions.failure === null ? null : (
            <p
              role="alert"
              className="flex items-center gap-2 px-4 text-xs whitespace-pre-wrap text-destructive"
            >
              <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
              {actions.failure}
            </p>
          )}
        </div>

        {/* Reset (mobile), copy and download section */}
        <div className="flex min-w-0 flex-row items-stretch md:min-w-90 md:shrink-0">
          {/* Reset (mobile) button */}
          <Button
            variant="ghost"
            onClick={reset}
            aria-label={t("editor.export.reset")}
            title={t("editor.export.reset")}
            className="h-12 w-12 shrink-0 rounded-none border-r border-border px-0 sm:hidden"
          >
            <IconRestore className="shrink-0" />
          </Button>

          {/* Copy button */}
          <Button
            variant="ghost"
            disabled={blocked || (raster && tooLarge)}
            onClick={() => {
              void actions.run(copyKind);
            }}
            className="h-12 min-w-0 flex-1 overflow-hidden rounded-none border-border px-5 sm:flex-initial sm:border-l md:flex-1"
          >
            {copied ? (
              <IconCheck className="shrink-0" />
            ) : (
              <IconCopy className="shrink-0" />
            )}
            <span className="min-w-0 truncate">
              {copied
                ? t("editor.actions.copied")
                : raster
                  ? t("editor.actions.copyImage")
                  : t("editor.export.copySvg")}
            </span>
          </Button>

          {/* Download button */}
          <Button
            disabled={blocked || tooLarge}
            onClick={() => {
              void actions.run("download");
            }}
            className="h-12 min-w-0 overflow-hidden rounded-none border-0 px-6 max-sm:flex-1"
          >
            {actions.busy === "download" ? (
              <Spinner className="shrink-0" />
            ) : (
              <IconDownload className="shrink-0" />
            )}
            <span className="min-w-0 truncate">
              {t("editor.export.download", {
                format: EXPORT_FORMAT_LABELS[settings.format],
              })}
            </span>
          </Button>
        </div>
      </ExportDialog.Footer>
    </ExportDialog>
  );
}
