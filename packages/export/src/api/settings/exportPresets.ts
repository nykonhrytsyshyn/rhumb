import type { ExportSettings } from "./exportSettings";

export type ExportColors = Pick<
  ExportSettings,
  "ink" | "fill" | "hollow" | "background" | "transparent"
>;

export const EXPORT_PRESET_IDS = [
  "print",
  "paper",
  "dark",
  "blueprint",
  "clear",
] as const;

export type ExportPresetId = (typeof EXPORT_PRESET_IDS)[number];

export const EXPORT_PRESETS: Readonly<Record<ExportPresetId, ExportColors>> = {
  print: {
    ink: "#000000",
    fill: "#ffffff",
    hollow: false,
    background: "#ffffff",
    transparent: false,
  },
  paper: {
    ink: "#3b2f1e",
    fill: "#fbf7ec",
    hollow: false,
    background: "#f3ecd9",
    transparent: false,
  },
  dark: {
    ink: "#e6e6ea",
    fill: "#1b1b22",
    hollow: false,
    background: "#101014",
    transparent: false,
  },
  blueprint: {
    ink: "#ffffff",
    fill: "#1e3a8a",
    hollow: true,
    background: "#1e3a8a",
    transparent: false,
  },
  clear: {
    ink: "#000000",
    fill: "#ffffff",
    hollow: false,
    background: "#ffffff",
    transparent: true,
  },
};
