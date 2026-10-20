import { useSyncExternalStore } from "react";

import type { StandardProfile } from "@rhumb/profiles";

import { type ProfileCatalog, profileCatalog } from "./profile-catalog";

export function useProfiles(
  catalog: ProfileCatalog = profileCatalog,
): readonly StandardProfile[] {
  return useSyncExternalStore(catalog.subscribe, catalog.getSnapshot);
}
