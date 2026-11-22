import type { JSX } from "react";

import { StandardManagerActions } from "./standard-manager-actions";
import { StandardManagerDeleteDialog } from "./standard-manager-delete-dialog";
import { StandardManagerHeader } from "./standard-manager-header";
import { StandardManagerNameDialog } from "./standard-manager-name-dialog";
import {
  StandardManagerRoot,
  type StandardManagerRootProps,
} from "./standard-manager-root";
import { StandardManagerSelect } from "./standard-manager-select";

interface StandardManagerComponent {
  (props: StandardManagerRootProps): JSX.Element;
  Header: typeof StandardManagerHeader;
  Actions: typeof StandardManagerActions;
  Select: typeof StandardManagerSelect;
  NameDialog: typeof StandardManagerNameDialog;
  DeleteDialog: typeof StandardManagerDeleteDialog;
}

export const StandardManager: StandardManagerComponent = Object.assign(
  StandardManagerRoot,
  {
    Header: StandardManagerHeader,
    Actions: StandardManagerActions,
    Select: StandardManagerSelect,
    NameDialog: StandardManagerNameDialog,
    DeleteDialog: StandardManagerDeleteDialog,
  },
);
