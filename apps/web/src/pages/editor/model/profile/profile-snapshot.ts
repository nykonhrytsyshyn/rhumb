import type { StandardProfile } from "@rhumb/profiles";

export interface ProfileSnapshot {
  readonly all: readonly StandardProfile[];
  readonly builtIn: readonly StandardProfile[];
  readonly custom: readonly StandardProfile[];
}
