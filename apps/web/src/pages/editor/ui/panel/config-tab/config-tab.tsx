import type { JSX } from "react";

import type { DiagramLibrary } from "../../../model/diagram";
import type { ProfileEditor } from "../../../model/profile";
import type { DeveloperMode } from "../../../model/use-developer-mode";
import { OtherSection } from "./other-section";
import { ProfileSection } from "./profile-section";

export interface ConfigTabProps {
  readonly editor: ProfileEditor;
  readonly onProfileSelect: (id: string) => void;
  readonly onProfileRemove: (
    id: string,
    replacementId: string,
  ) => Promise<boolean>;
  readonly library: DiagramLibrary;
  readonly developer: DeveloperMode;
}

export function ConfigTab({
  editor,
  onProfileSelect,
  onProfileRemove,
  library,
  developer,
}: ConfigTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ProfileSection
        editor={editor}
        library={library}
        onProfileSelect={onProfileSelect}
        onProfileRemove={onProfileRemove}
      />
      <OtherSection developer={developer} />
    </div>
  );
}
