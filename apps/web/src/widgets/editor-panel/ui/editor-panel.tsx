import type { JSX } from "react";

import { EditorPanelBody } from "./editor-panel-body";
import { EditorPanelContent } from "./editor-panel-content";
import { EditorPanelHandle } from "./editor-panel-handle";
import { EditorPanelPane } from "./editor-panel-pane";
import { EditorPanelSection } from "./editor-panel-section";
import {
  EditorPanelShell,
  type EditorPanelShellProps,
} from "./editor-panel-shell";
import { EditorPanelTabs } from "./editor-panel-tabs";
import { EditorPanelToggle } from "./editor-panel-toggle";

interface EditorPanelComponent {
  (props: EditorPanelShellProps): JSX.Element;
  Handle: typeof EditorPanelHandle;
  Body: typeof EditorPanelBody;
  Tabs: typeof EditorPanelTabs;
  Content: typeof EditorPanelContent;
  Pane: typeof EditorPanelPane;
  Section: typeof EditorPanelSection;
  Toggle: typeof EditorPanelToggle;
}

export const EditorPanel: EditorPanelComponent = Object.assign(
  EditorPanelShell,
  {
    Handle: EditorPanelHandle,
    Body: EditorPanelBody,
    Tabs: EditorPanelTabs,
    Content: EditorPanelContent,
    Pane: EditorPanelPane,
    Section: EditorPanelSection,
    Toggle: EditorPanelToggle,
  },
);
