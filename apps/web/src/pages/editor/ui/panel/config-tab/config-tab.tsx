import type { JSX } from "react";

import type { ProfileEditor } from "../../../model/profile";
import type { DeveloperMode } from "../../../model/use-developer-mode";
import { OtherSection } from "./other-section";
import { ProfileSection } from "./profile-section";

export interface ConfigTabProps {
  readonly editor: ProfileEditor;
  readonly onProfileSelect: (id: string) => void;
  readonly developer: DeveloperMode;
}

export function ConfigTab({
  editor,
  onProfileSelect,
  developer,
}: ConfigTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ProfileSection editor={editor} onProfileSelect={onProfileSelect} />
      <OtherSection developer={developer} />
    </div>
  );
}
