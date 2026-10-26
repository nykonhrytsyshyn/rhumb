export const AGENT_KIT_BASE_PATH = "/agents/";
export const AGENT_KIT_HOMEPAGE = "https://rhumb.nykon.me";
export const AGENT_KIT_KINDS = ["skill", "prompt"] as const;
export const AGENT_KIT_IDS = [
  "diagramsSkill",
  "diagramsPrompt",
  "diagramsPromptShort",
] as const;

export type AgentKitKind = (typeof AGENT_KIT_KINDS)[number];
export type AgentKitId = (typeof AGENT_KIT_IDS)[number];

export interface AgentKitFileInfo {
  readonly id: AgentKitId;
  readonly kind: AgentKitKind;
  readonly fileName: string;
  readonly mime: string;
}

export const AGENT_KIT_FILES: readonly AgentKitFileInfo[] = [
  {
    id: "diagramsSkill",
    kind: "skill",
    fileName: "rhumb-diagrams.zip",
    mime: "application/zip",
  },
  {
    id: "diagramsPrompt",
    kind: "prompt",
    fileName: "rhumb-diagrams-prompt.md",
    mime: "text/markdown; charset=utf-8",
  },
  {
    id: "diagramsPromptShort",
    kind: "prompt",
    fileName: "rhumb-diagrams-prompt-short.md",
    mime: "text/markdown; charset=utf-8",
  },
];

export function agentKitPath(file: Pick<AgentKitFileInfo, "fileName">): string {
  return `${AGENT_KIT_BASE_PATH}${file.fileName}`;
}
