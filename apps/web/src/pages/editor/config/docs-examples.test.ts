// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { DiagramSyntaxError } from "@rhumb/kernel";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { SUPPORTED_LANGUAGES } from "@shared/i18n";

import { DOCS_EXAMPLES } from "./docs-examples";

describe("the examples of the documentation", () => {
  for (const [id, sources] of Object.entries(DOCS_EXAMPLES)) {
    for (const language of SUPPORTED_LANGUAGES) {
      it(`${id} is valid in ${language}`, () => {
        const parse = (): unknown =>
          new FlowchartParser().parse(sources[language]);

        try {
          expect(parse()).toBeDefined();
        } catch (error) {
          throw error instanceof DiagramSyntaxError
            ? new Error(error.message)
            : error;
        }
      });
    }
  }
});
