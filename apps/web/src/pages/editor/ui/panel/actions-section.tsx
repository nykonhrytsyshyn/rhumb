import { type JSX, useId, useState } from "react";

import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react";

import type { StandardProfile } from "@rhumb/profiles";

import { EditorPanel } from "@widgets/editor-panel";

import { useT } from "@shared/i18n";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Button } from "@shared/ui/button";
import { Label } from "@shared/ui/label";
import { Switch } from "@shared/ui/switch";

import { copyPng, exportPng, exportSvg } from "../../lib/export-diagram";

export interface ActionsSectionProps {
  readonly source: string;
  readonly profile: StandardProfile | undefined;
}

type Action = "png" | "svg" | "copy";

export function ActionsSection({
  source,
  profile,
}: ActionsSectionProps): JSX.Element {
  const t = useT();
  const switchId = useId();
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState<Action | null>(null);
  const [copied, setCopied] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function run(action: Action) {
    if (profile === undefined) {
      return;
    }

    const options = { transparent };

    setBusy(action);
    setFailure(null);
    setCopied(false);

    try {
      switch (action) {
        case "png":
          await exportPng(source, profile, options);
          break;
        case "svg":
          await exportSvg(source, profile, options);
          break;
        case "copy":
          await copyPng(source, profile, options);
          setCopied(true);
          break;
      }
    } catch (error) {
      setFailure(`${t("editor.actions.failed")}: ${getErrorMessage(error)}`);
    } finally {
      setBusy(null);
    }
  }

  const disabled = profile === undefined || busy !== null;

  return (
    <EditorPanel.Section
      icon={<IconUpload />}
      title={t("common.sections.actions")}
      defaultOpen
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => {
              void run("png");
            }}
          >
            <IconDownload /> {t("editor.actions.png")}
          </Button>

          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => {
              void run("svg");
            }}
          >
            <IconDownload /> {t("editor.actions.svg")}
          </Button>

          <Button
            variant="outline"
            disabled={disabled}
            onClick={() => {
              void run("copy");
            }}
          >
            {copied ? <IconCheck /> : <IconCopy />}
            {copied
              ? t("editor.actions.copied")
              : t("editor.actions.copyImage")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={switchId}
            checked={transparent}
            onCheckedChange={setTransparent}
          />

          <Label htmlFor={switchId} className="text-sm">
            {t("editor.actions.transparent")}
          </Label>
        </div>

        {failure !== null && (
          <p
            role="alert"
            className="text-xs whitespace-pre-wrap text-destructive"
          >
            {failure}
          </p>
        )}
      </div>
    </EditorPanel.Section>
  );
}
