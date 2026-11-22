import type { StandardProfile } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";
import { toFileName } from "@shared/lib/to-file-name";

export function downloadProfile(profile: StandardProfile): void {
  downloadBlob(
    new Blob([`${JSON.stringify(profile, null, 2)}\n`], {
      type: "application/json",
    }),
    `${toFileName(profile.title)}.json`,
  );
}
