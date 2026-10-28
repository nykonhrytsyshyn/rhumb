import type { JSX } from "react";

import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconLink,
} from "@tabler/icons-react";

import type { AgentKitFileInfo } from "@rhumb/agent-kit";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import { useAgentKitFile } from "../model";

export interface AgentKitItemProps {
  readonly file: AgentKitFileInfo;
}

export function AgentKitItem({ file }: AgentKitItemProps): JSX.Element {
  const t = useT();
  const { busy, done, failure, run } = useAgentKitFile(file);
  const isPrompt = file.kind === "prompt";

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">
          {t(`common.agentKit.files.${file.id}.title`)}
        </span>

        <span className="text-xs text-muted-foreground">
          {t(`common.agentKit.files.${file.id}.description`)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {isPrompt && (
          <Button
            variant="default"
            size="sm"
            disabled={busy !== null}
            onClick={() => {
              run("copy");
            }}
          >
            {done === "copy" ? <IconCheck /> : <IconCopy />}
            {done === "copy"
              ? t("common.agentKit.copied")
              : t("common.agentKit.copy")}
          </Button>
        )}

        <Button
          variant={isPrompt ? "outline" : "default"}
          size="sm"
          disabled={busy !== null}
          onClick={() => {
            run("download");
          }}
        >
          {done === "download" ? <IconCheck /> : <IconDownload />}
          {t("common.agentKit.download")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => {
            run("link");
          }}
        >
          {done === "link" ? <IconCheck /> : <IconLink />}
          {done === "link"
            ? t("common.agentKit.linkCopied")
            : t("common.agentKit.copyLink")}
        </Button>
      </div>

      {failure !== null && (
        <p role="alert" className="text-xs text-destructive">
          {t("common.agentKit.failed")}: {failure}
        </p>
      )}
    </li>
  );
}
