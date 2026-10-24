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
  storedData: "docs.blocks.storedData",
  internalStorage: "docs.blocks.internalStorage",
  sequentialStorage: "docs.blocks.sequentialStorage",
  directStorage: "docs.blocks.directStorage",
  document: "docs.blocks.document",
  paperTape: "docs.blocks.paperTape",
  manualInput: "docs.blocks.manualInput",
  card: "docs.blocks.card",
  display: "docs.blocks.display",
  manualOperation: "docs.blocks.manualOperation",
  parallel: "docs.blocks.parallel",
  loopStart: "docs.blocks.loopStart",
  loopEnd: "docs.blocks.loopEnd",
  transfer: "docs.blocks.transfer",
  comment: "docs.blocks.comment",
};
