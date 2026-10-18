import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * ESLint configuration
 *
 * @see {@link https://eslint.org/docs/latest/use/configure/configuration-files
 *      ESLint documentation}
 */
export default defineConfig(
  globalIgnores([
    "**/dist/**",
    "**/dev-dist/**",
    "**/node_modules/**",
    "**/coverage/**",
    "**/.vitest/**",
  ]),

  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-extraneous-class": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@rhumb/*/*"],
              message: "Import from the package root only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "Use an `as const` object with a union type instead of enum.",
        },
        {
          selector: "TSParameterProperty",
          message:
            "Declare class fields explicitly instead of parameter properties.",
        },
        {
          selector: "TSModuleDeclaration[kind='namespace']",
          message: "Namespaces are not allowed; use modules.",
        },
      ],
    },
  },

  prettier,
);
