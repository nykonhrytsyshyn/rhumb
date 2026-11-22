import type { JSX } from "react";

import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconLink,
} from "@tabler/icons-react";

import type { AgentKitFileInfo } from "@rhumb/agent-kit";

import { useT } from "@shared/i18n";
import { Button, ButtonGroup } from "@shared/ui/button";

import { useAgentKitFile } from "../model";

export interface AgentKitItemProps {
  readonly file: AgentKitFileInfo;
}

export function AgentKitItem({ file }: AgentKitItemProps): JSX.Element {
  const t = useT();
  const { busy, done, failure, run } = useAgentKitFile(file);
  const isPrompt = file.kind === "prompt";

  const downloadButton = (
    <Button
      variant={isPrompt ? "outline" : "default"}
      size="sm"
      disabled={busy !== null}
      className="min-w-0 flex-auto shrink overflow-hidden"
      onClick={() => {
        run("download");
      }}
    >
      {done === "download" ? <IconCheck /> : <IconDownload />}
      <span className="min-w-0 truncate">{t("common.agentKit.download")}</span>
    </Button>
  );

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

      <div className="flex min-w-0 flex-wrap gap-2">
        {isPrompt ? (
          <ButtonGroup className="w-auto max-w-full min-w-0 grow">
            <Button
              variant="default"
              size="sm"
              disabled={busy !== null}
              className="min-w-0 flex-auto shrink overflow-hidden"
              onClick={() => {
                run("copy");
              }}
            >
              {done === "copy" ? <IconCheck /> : <IconCopy />}
              <span className="min-w-0 truncate">
                {done === "copy"
                  ? t("common.agentKit.copied")
                  : t("common.agentKit.copy")}
              </span>
            </Button>

            {downloadButton}
          </ButtonGroup>
        ) : (
          downloadButton
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={busy !== null}
          className="min-w-0 flex-auto shrink overflow-hidden"
          onClick={() => {
            run("link");
          }}
        >
          {done === "link" ? <IconCheck /> : <IconLink />}
          <span className="min-w-0 truncate">
            {done === "link"
              ? t("common.agentKit.linkCopied")
              : t("common.agentKit.copyLink")}
          </span>
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
