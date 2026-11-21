import type { JSX } from "react";

import { ExportDialogBody } from "./export-dialog-body";
import { ExportDialogChoice } from "./export-dialog-choice";
import { ExportDialogColor } from "./export-dialog-color";
import { ExportDialogFooter } from "./export-dialog-footer";
import { ExportDialogName } from "./export-dialog-name";
import { ExportDialogPresets } from "./export-dialog-presets";
import { ExportDialogPreview } from "./export-dialog-preview";
import { ExportDialogSection } from "./export-dialog-section";
import { ExportDialogSettings } from "./export-dialog-settings";
import {
  ExportDialogShell,
  type ExportDialogShellProps,
} from "./export-dialog-shell";
import { ExportDialogSlider } from "./export-dialog-slider";
import { ExportDialogSwitch } from "./export-dialog-switch";

interface ExportDialogComponent {
  (props: ExportDialogShellProps): JSX.Element;
  Body: typeof ExportDialogBody;
  Preview: typeof ExportDialogPreview;
  Settings: typeof ExportDialogSettings;
  Section: typeof ExportDialogSection;
  Presets: typeof ExportDialogPresets;
  Choice: typeof ExportDialogChoice;
  Slider: typeof ExportDialogSlider;
  Color: typeof ExportDialogColor;
  Switch: typeof ExportDialogSwitch;
  Name: typeof ExportDialogName;
  Footer: typeof ExportDialogFooter;
}

export const ExportDialog: ExportDialogComponent = Object.assign(
  ExportDialogShell,
  {
    Body: ExportDialogBody,
    Preview: ExportDialogPreview,
    Settings: ExportDialogSettings,
    Section: ExportDialogSection,
    Presets: ExportDialogPresets,
    Choice: ExportDialogChoice,
    Slider: ExportDialogSlider,
    Color: ExportDialogColor,
    Switch: ExportDialogSwitch,
    Name: ExportDialogName,
    Footer: ExportDialogFooter,
  },
);
