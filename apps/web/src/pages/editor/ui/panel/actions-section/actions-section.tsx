import { type JSX, useState } from "react";

import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconCheck,
  IconChevronUp,
  IconCode,
  IconCopy,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";

import {
  EXPORT_FORMATS,
  EXPORT_FORMAT_LABELS,
  exceedsRasterLimit,
  exportDimensions,
} from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { EditorPanel } from "@widgets/editor-panel";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";
import { Spinner } from "@shared/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

import {
  defaultExportName,
  formatExportTimestamp,
} from "../../../lib/export-diagram";
import type { RenderState } from "../../../model/diagram";
import { useExportActions } from "../../../model/use-export-actions";
import { useExportSettings } from "../../../model/use-export-settings";
import { ExportSettingsDialog } from "./export-settings-dialog";

export interface ActionsSectionProps {
  readonly source: string;
  readonly profile: StandardProfile | undefined;
  readonly rendered: RenderState;
  readonly diagramName?: string | undefined;
}

export function ActionsSection({
  source,
  profile,
  rendered,
  diagramName,
}: ActionsSectionProps): JSX.Element {
  const t = useT();
  const model = useExportSettings();
  const actions = useExportActions(
    source,
    profile,
    model.settings,
    diagramName,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(() => formatExportTimestamp());
  const defaultFileName =
    diagramName !== undefined && diagramName.trim() !== ""
      ? defaultExportName(diagramName)
      : timestamp;

  const { settings } = model;
  const { size } = rendered;
  const format = EXPORT_FORMAT_LABELS[settings.format];
  const blocked =
    profile === undefined ||
    actions.busy !== null ||
    (size !== null && exceedsRasterLimit(size, settings));
  const pixels = size === null ? null : exportDimensions(size, settings);

  return (
    <EditorPanel.Section
      icon={<IconUpload />}
      title={t("common.sections.actions")}
      defaultOpen
    >
      <div className="flex flex-col gap-3">
        {/* Summary */}
        <p className="text-xs text-muted-foreground tabular-nums">
          {pixels === null
            ? format
            : t("editor.export.summary", {
                format,
                width: pixels.width,
                height: pixels.height,
              })}
        </p>

        {/* Attached footer-like bar */}
        <div className="-mx-3 -mb-5 flex flex-col border-t border-border">
          {actions.failure === null ? null : (
            <p
              role="alert"
              className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs whitespace-pre-wrap text-destructive"
            >
              <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
              {actions.failure}
            </p>
          )}

          <div className="flex min-w-0 items-stretch">
            {/* Settings icon button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setTimestamp(formatExportTimestamp());
                      setDialogOpen(true);
                    }}
                    aria-label={t("editor.export.open")}
                    className="size-12 shrink-0 rounded-none border-0 border-r border-border px-0"
                  />
                }
              >
                <IconAdjustmentsHorizontal className="shrink-0" />
              </TooltipTrigger>

              <TooltipContent>{t("editor.export.open")}</TooltipContent>
            </Tooltip>

            {/* Copy button */}
            <Button
              variant="ghost"
              disabled={blocked}
              onClick={() => {
                void actions.run("copy-image");
              }}
              className="h-12 min-w-0 flex-1 overflow-hidden rounded-none border-0 border-r border-border px-3"
            >
              {actions.copied === "copy-image" ? (
                <IconCheck className="shrink-0" />
              ) : (
                <IconCopy className="shrink-0" />
              )}
              <span className="min-w-0 truncate">
                {actions.copied === "copy-image"
                  ? t("editor.actions.copied")
                  : t("editor.actions.copyImage")}
              </span>
            </Button>

            {/* Download button */}
            <Button
              disabled={blocked}
              onClick={() => {
                void actions.run("download");
              }}
              className="h-12 min-w-0 flex-1 overflow-hidden rounded-none border-0 px-3"
            >
              {actions.busy === "download" ? (
                <Spinner className="shrink-0" />
              ) : (
                <IconDownload className="shrink-0" />
              )}
              <span className="min-w-0 truncate">
                {t("editor.export.download", { format })}
              </span>
            </Button>

            {/* Format menu */}
            <DropdownMenu>
              <Tooltip>
                <DropdownMenuTrigger
                  render={
                    <TooltipTrigger
                      render={
                        <Button
                          aria-label={t("editor.export.formatMenu")}
                          className="group size-12 shrink-0 rounded-none border-0 border-l border-primary/60 px-0"
                        />
                      }
                    />
                  }
                >
                  <IconChevronUp className="shrink-0 transition-transform duration-150 group-aria-expanded:rotate-180" />
                </DropdownMenuTrigger>

                <TooltipContent>{t("editor.export.formatMenu")}</TooltipContent>
              </Tooltip>

              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {t("editor.export.format")}
                  </DropdownMenuLabel>

                  <DropdownMenuRadioGroup
                    value={settings.format}
                    onValueChange={(value) => {
                      const next = EXPORT_FORMATS.find(
                        (item) => item === value,
                      );

                      if (next !== undefined) {
                        model.change({ format: next });
                      }
                    }}
                  >
                    {EXPORT_FORMATS.map((item) => (
                      <DropdownMenuRadioItem key={item} value={item}>
                        {EXPORT_FORMAT_LABELS[item]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={profile === undefined || actions.busy !== null}
                  onClick={() => {
                    void actions.run("copy-svg");
                  }}
                >
                  <IconCode /> {t("editor.export.copySvg")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ExportSettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        model={model}
        actions={actions}
        profile={profile}
        rendered={rendered}
        defaultFileName={defaultFileName}
      />
    </EditorPanel.Section>
  );
}
