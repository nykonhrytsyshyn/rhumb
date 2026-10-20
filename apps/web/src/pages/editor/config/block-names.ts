import type { NodeKind } from "@rhumb/kernel";

import type { TranslationKey } from "@shared/i18n";

export const BLOCK_NAMES: Readonly<Record<NodeKind, TranslationKey>> = {
  process: "docs.blocks.process",
  terminator: "docs.blocks.terminator",
  decision: "docs.blocks.decision",
  io: "docs.blocks.io",
  preparation: "docs.blocks.preparation",
  predefinedProcess: "docs.blocks.predefined",
  connector: "docs.blocks.connector",
};
