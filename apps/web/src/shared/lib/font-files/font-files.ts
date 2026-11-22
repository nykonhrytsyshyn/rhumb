import type { EmbeddedFontFormat } from "@rhumb/export";

import interUrl from "../../assets/fonts/Inter-Variable.woff2?url";
import jetBrainsMonoUrl from "../../assets/fonts/JetBrains-Mono-Variable.woff2?url";
import openGostAUrl from "../../assets/fonts/OpenGost-Type-A.woff2?url";
import openGostBUrl from "../../assets/fonts/OpenGost-Type-B.woff2?url";

export interface FontFile {
  readonly family: string;
  readonly url: string;
  readonly format: EmbeddedFontFormat;
  readonly weight: string;
}

/**
 * The font files the site ships with, which exports carry along when a diagram
 * uses them. Keep in step with the `@font-face` rules in fonts.css.
 */
export const FONT_FILES: readonly FontFile[] = [
  {
    family: "OpenGost Type A",
    url: openGostAUrl,
    format: "woff2",
    weight: "400",
  },
  {
    family: "OpenGost Type B",
    url: openGostBUrl,
    format: "woff2",
    weight: "400",
  },
  {
    family: "Inter Variable",
    url: interUrl,
    format: "woff2",
    weight: "100 900",
  },
  {
    family: "JetBrains Mono Variable",
    url: jetBrainsMonoUrl,
    format: "woff2",
    weight: "100 800",
  },
];
