import type { StandardProfile } from "@rhumb/profiles";

import { type ProfileCatalog, profileCatalog } from "./profile-catalog";
import { useProfileGroups } from "./use-profile-groups";

export function useProfiles(
  catalog: ProfileCatalog = profileCatalog,
): readonly StandardProfile[] {
  return useProfileGroups(catalog).all;
}
