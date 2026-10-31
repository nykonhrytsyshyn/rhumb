import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

import fsd from "@rhumb/eslint-plugin-fsd";

export interface RhumbEslintOptions {
  readonly tsconfigRootDir: string;
}

const TS_FILES = ["**/*.{ts,tsx,mts,cts}"];

/**
 * Rules that the TypeScript compiler already enforces through
 * `@rhumb/tsconfig/base.json`.
 *
 *  - no-unused-vars   <- noUnusedLocals / noUnusedParameters
 *  - no-fallthrough   <- noFallthroughCasesInSwitch
 *  - no-unreachable   <- allowUnreachableCode: false
 *  - no-unused-labels <- allowUnusedLabels: false
 */
const COVERED_BY_TYPESCRIPT = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-fallthrough": "off",
  "no-unreachable": "off",
  "no-unused-labels": "off",
} as const;

/**
 * ESLint configuration shared by the whole workspace.
 *
 * @see {@link https://eslint.org/docs/latest/use/configure/configuration-files
 *      ESLint documentation}
 */
export function rhumbConfig({ tsconfigRootDir }: RhumbEslintOptions) {
  return defineConfig(
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
          tsconfigRootDir,
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
      files: ["**/*.{js,mjs,cjs}"],
      extends: [tseslint.configs.disableTypeChecked],
    },

    {
      name: "rhumb/covered-by-typescript",
      files: TS_FILES,
      rules: COVERED_BY_TYPESCRIPT,
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

    {
      files: ["apps/web/src/**/*.{ts,tsx}"],
      plugins: { fsd },
      rules: { "fsd/fsd-logic": "error" },
    },

    prettier,
  );
}
