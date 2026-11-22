export type SiteFontGroup = "gost" | "interface";

export interface SiteFont {
  readonly id: string;
  readonly family: string;
  readonly group: SiteFontGroup;
  readonly stack: string;
}

export const SITE_FONTS: readonly SiteFont[] = [
  {
    id: "opengost-a",
    family: "OpenGost Type A",
    group: "gost",
    stack: "'OpenGost Type A', Arial, sans-serif",
  },
  {
    id: "opengost-b",
    family: "OpenGost Type B",
    group: "gost",
    stack: "'OpenGost Type B', Arial, sans-serif",
  },
  {
    id: "inter",
    family: "Inter Variable",
    group: "interface",
    stack: "'Inter Variable', Arial, sans-serif",
  },
  {
    id: "jetbrains-mono",
    family: "JetBrains Mono Variable",
    group: "interface",
    stack: "'JetBrains Mono Variable', monospace",
  },
];

export const SITE_FONT_GROUPS: readonly SiteFontGroup[] = ["gost", "interface"];
