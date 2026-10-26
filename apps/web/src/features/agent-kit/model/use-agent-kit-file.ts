import { useCallback, useEffect, useState } from "react";

import { type AgentKitFileInfo, agentKitPath } from "@rhumb/agent-kit";

import { copyText } from "@shared/lib/copy-text";
import { downloadBlob } from "@shared/lib/download-blob";
import { getErrorMessage } from "@shared/lib/get-error-message";

export type AgentKitAction = "download" | "copy" | "link";

const FEEDBACK_MS = 2000;

async function fetchFile(file: AgentKitFileInfo): Promise<Response> {
  const response = await fetch(agentKitPath(file));

  if (!response.ok) {
    throw new Error(`${file.fileName}: ${String(response.status)}`);
  }

  return response;
}

export interface AgentKitFileState {
  readonly busy: AgentKitAction | null;
  readonly done: AgentKitAction | null;
  readonly failure: string | null;
  readonly run: (action: AgentKitAction) => void;
}

export function useAgentKitFile(file: AgentKitFileInfo): AgentKitFileState {
  const [busy, setBusy] = useState<AgentKitAction | null>(null);
  const [done, setDone] = useState<AgentKitAction | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (done === null) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDone(null);
    }, FEEDBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [done]);

  const run = useCallback(
    (action: AgentKitAction) => {
      setBusy(action);
      setDone(null);
      setFailure(null);

      const work = async (): Promise<void> => {
        switch (action) {
          case "download":
            downloadBlob(await (await fetchFile(file)).blob(), file.fileName);
            break;
          case "copy":
            await copyText(fetchFile(file).then((response) => response.text()));
            break;
          case "link":
            await copyText(
              new URL(agentKitPath(file), window.location.origin).href,
            );
            break;
        }
      };

      work()
        .then(() => {
          setDone(action);
        })
        .catch((error: unknown) => {
          setFailure(getErrorMessage(error));
        })
        .finally(() => {
          setBusy(null);
        });
    },
    [file],
  );

  return { busy, done, failure, run };
}
