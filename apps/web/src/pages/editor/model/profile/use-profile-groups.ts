import { useSyncExternalStore } from "react";

import { type ProfileCatalog, profileCatalog } from "./profile-catalog";
import type { ProfileSnapshot } from "./profile-snapshot";

export function useProfileGroups(
  catalog: ProfileCatalog = profileCatalog,
): ProfileSnapshot {
  return useSyncExternalStore(catalog.subscribe, catalog.getSnapshot);
}
