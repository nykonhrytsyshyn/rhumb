import { rhumbConfig } from "@rhumb/eslint-config";

/**
 * ESLint configuration.
 *
 * Note: The rules live in `packages/eslint-config`.
 *
 * @see {@link https://eslint.org/docs/latest/use/configure/configuration-files
 *      ESLint documentation}
 */
export default rhumbConfig({ tsconfigRootDir: import.meta.dirname });
