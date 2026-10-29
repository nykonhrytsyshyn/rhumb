import type { Rule } from "eslint";
import type { ImportDeclaration } from "estree";

import {
  CROSS_SLICE_EXEMPT_LAYERS,
  INDEX_PATTERN,
  LAYER_WEIGHTS,
  PUBLIC_API_INDEX_ENTRY_LAYERS,
  locateFile,
  parseImport,
} from "./layers";
import { hasPublicDirectoryIndex } from "./public-api";

export const fsdLogic: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      publicApi:
        "FSD: Public API violation. Direct import of internal files is prohibited.",
      layerHierarchy:
        "FSD: Layer hierarchy violation. The [{{importLayer}}] layer cannot be imported from [{{currentLayer}}].",
      crossSlice:
        "FSD: Hierarchy violation. Importing between slices of the same layer [{{layer}}] is not allowed ({{importSlice}} <- {{currentSlice}}).",
    },
    schema: [],
  },

  create(context) {
    const { layer: currentLayer, slice: currentSlice } = locateFile(
      context.filename,
    );

    return {
      ImportDeclaration(node: ImportDeclaration) {
        const specifier: unknown = node.source.value;

        if (typeof specifier !== "string") {
          return;
        }

        const parsed = parseImport(specifier);

        if (!parsed) {
          return;
        }

        const { layer: importLayer, slice: importSlice, internalPath } = parsed;

        if (currentLayer) {
          if (LAYER_WEIGHTS[importLayer] < LAYER_WEIGHTS[currentLayer]) {
            context.report({
              node,
              messageId: "layerHierarchy",
              data: { importLayer, currentLayer },
            });

            return;
          }

          if (
            currentLayer === importLayer &&
            !CROSS_SLICE_EXEMPT_LAYERS.has(currentLayer) &&
            currentSlice !== importSlice
          ) {
            context.report({
              node,
              messageId: "crossSlice",
              data: {
                layer: currentLayer,
                importSlice,
                currentSlice: String(currentSlice),
              },
            });

            return;
          }
        }

        if (internalPath === undefined) {
          return;
        }

        if (INDEX_PATTERN.test(internalPath)) {
          return;
        }

        if (
          PUBLIC_API_INDEX_ENTRY_LAYERS.has(importLayer) &&
          hasPublicDirectoryIndex(specifier, context.filename, importLayer)
        ) {
          return;
        }

        context.report({ node, messageId: "publicApi" });
      },
    };
  },
};
