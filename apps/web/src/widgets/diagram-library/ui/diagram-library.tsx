import type { JSX } from "react";

import { DiagramLibraryCard } from "./diagram-library-card";
import { DiagramLibraryEmpty } from "./diagram-library-empty";
import { DiagramLibraryError } from "./diagram-library-error";
import { DiagramLibraryGrid } from "./diagram-library-grid";
import { DiagramLibraryLoading } from "./diagram-library-loading";
import { DiagramLibraryNoMatches } from "./diagram-library-no-matches";
import { DiagramLibrarySaveForm } from "./diagram-library-save-form";
import { DiagramLibrarySearch } from "./diagram-library-search";
import {
  DiagramLibraryShell,
  type DiagramLibraryShellProps,
} from "./diagram-library-shell";

interface DiagramLibraryComponent {
  (props: DiagramLibraryShellProps): JSX.Element;
  SaveForm: typeof DiagramLibrarySaveForm;
  Error: typeof DiagramLibraryError;
  Search: typeof DiagramLibrarySearch;
  Loading: typeof DiagramLibraryLoading;
  Empty: typeof DiagramLibraryEmpty;
  NoMatches: typeof DiagramLibraryNoMatches;
  Grid: typeof DiagramLibraryGrid;
  Card: typeof DiagramLibraryCard;
}

export const DiagramLibrary: DiagramLibraryComponent = Object.assign(
  DiagramLibraryShell,
  {
    SaveForm: DiagramLibrarySaveForm,
    Error: DiagramLibraryError,
    Search: DiagramLibrarySearch,
    Loading: DiagramLibraryLoading,
    Empty: DiagramLibraryEmpty,
    NoMatches: DiagramLibraryNoMatches,
    Grid: DiagramLibraryGrid,
    Card: DiagramLibraryCard,
  },
);
