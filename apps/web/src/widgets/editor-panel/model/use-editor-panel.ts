import { useContext } from "react";

import {
  EditorPanelContext,
  type EditorPanelContextValue,
} from "./editor-panel-context";

export function useEditorPanel(): EditorPanelContextValue {
  const context = useContext(EditorPanelContext);

  if (context === null) {
    throw new Error("EditorPanel components must be used within <EditorPanel>");
  }

  return context;
}
