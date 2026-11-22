import type { JSX } from "react";

import { IconCopy, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { ButtonGroup } from "@shared/ui/button";

import { StandardManagerAction } from "./standard-manager-action";

export interface StandardManagerActionsProps {
  /** Rename and delete only make sense for a custom standard. */
  readonly customSelected: boolean;
  readonly onCreate: () => void;
  readonly onDuplicate: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
}

export function StandardManagerActions({
  customSelected,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}: StandardManagerActionsProps): JSX.Element {
  const t = useT();

  return (
    <ButtonGroup>
      <StandardManagerAction
        label={t("editor.config.manage.create")}
        onClick={onCreate}
      >
        <IconPlus />
      </StandardManagerAction>

      <StandardManagerAction
        label={t("editor.config.manage.duplicate")}
        onClick={onDuplicate}
      >
        <IconCopy />
      </StandardManagerAction>

      <StandardManagerAction
        label={t("editor.config.manage.rename")}
        disabled={!customSelected}
        onClick={onRename}
      >
        <IconPencil />
      </StandardManagerAction>

      <StandardManagerAction
        label={t("editor.config.manage.delete")}
        disabled={!customSelected}
        destructive
        onClick={onDelete}
      >
        <IconTrash />
      </StandardManagerAction>
    </ButtonGroup>
  );
}
