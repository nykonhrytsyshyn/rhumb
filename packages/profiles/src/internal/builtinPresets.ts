import gost from "../../presets/gost-19.701-90.json";
import iso from "../../presets/iso-5807.json";

/**
 * The standards that ship with the package. The first one is the default
 * when a profile does not say otherwise. A test checks that this list matches
 * the files of the `presets` folder, so a new preset cannot be forgotten.
 */
export function loadBuiltinPresets(): readonly unknown[] {
  return [gost, iso];
}
