import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

/**
 * Steiger configuration
 *
 * @see {@link https://github.com/feature-sliced/steiger Steiger documentation}
 */
// noinspection JSUnusedGlobalSymbols
export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["**/testing/**"],
  },
]);
