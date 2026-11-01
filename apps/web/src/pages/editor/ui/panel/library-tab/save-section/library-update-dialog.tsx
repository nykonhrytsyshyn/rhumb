import type { JSX } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import type { SavedDiagram } from "../../../../model/diagram";
import { LibraryUpdateComparison } from "./library-update-comparison";

export interface LibraryUpdateDialogProps {
  readonly saved: SavedDiagram;
  readonly source: string;
  readonly profileId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
  readonly standardTitle: (profileId: string) => string;
}

export function LibraryUpdateDialog({
  saved,
  source,
  profileId,
  open,
  onOpenChange,
  onConfirm,
  standardTitle,
}: LibraryUpdateDialogProps): JSX.Element {
  return (
    <DiagramLibrary.UpdateDialog
      name={saved.name}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      unchanged={saved.source === source && saved.profileId === profileId}
    >
      <LibraryUpdateComparison
        saved={saved}
        source={source}
        profileId={profileId}
        standardTitle={standardTitle}
      />
    </DiagramLibrary.UpdateDialog>
  );
}
