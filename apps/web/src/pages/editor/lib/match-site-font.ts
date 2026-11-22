import { SITE_FONTS, type SiteFont } from "../config/site-fonts";
import { firstFontFamily } from "./first-font-family";

/** The site font that a font stack starts with, if it starts with one. */
export function matchSiteFont(stack: string): SiteFont | undefined {
  const family = firstFontFamily(stack).toLowerCase();

  return SITE_FONTS.find((font) => font.family.toLowerCase() === family);
}
