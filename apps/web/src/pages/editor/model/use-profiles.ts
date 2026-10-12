import { useSyncExternalStore } from "react";

import type { StandardProfile } from "@rhumb/profiles";

import { profileCatalog } from "./profile-catalog";

export function useProfiles(): readonly StandardProfile[] {
  return useSyncExternalStore(
    profileCatalog.subscribe,
    profileCatalog.getSnapshot,
  );
}
