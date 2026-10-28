import type { JSX } from "react";

import { AGENT_KIT_FILES } from "@rhumb/agent-kit";

import { AgentKitItem } from "./agent-kit-item";

export function AgentKitList(): JSX.Element {
  return (
    <ul className="divide-y rounded-2xl border">
      {AGENT_KIT_FILES.map((file) => (
        <AgentKitItem key={file.id} file={file} />
      ))}
    </ul>
  );
}
