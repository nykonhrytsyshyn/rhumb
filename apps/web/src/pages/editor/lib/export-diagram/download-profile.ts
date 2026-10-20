import type { StandardProfile } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

export function downloadProfile(profile: StandardProfile): void {
  downloadBlob(
    new Blob([`${JSON.stringify(profile, null, 2)}\n`], {
      type: "application/json",
    }),
    `${profile.id}.json`,
  );
}
