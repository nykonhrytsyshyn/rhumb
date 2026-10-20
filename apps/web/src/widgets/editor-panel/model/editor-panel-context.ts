import { createContext } from "react";

export interface EditorPanelContextValue {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
}

export const EditorPanelContext = createContext<EditorPanelContextValue | null>(
  null,
);
