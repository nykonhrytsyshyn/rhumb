import { type JSX, useMemo } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useI18n } from "@shared/i18n";

import { applyLibraryView, filterDiagrams } from "../../../lib/library-view";
import { scrollToTop, useScrollMemory } from "../../../lib/use-scroll-memory";
import { type SavedDiagram, useDiagramLibrary } from "../../../model/diagram";
import { CUSTOM_PROFILE_ID, useProfiles } from "../../../model/profile";
import { useLibrarySelection } from "../../../model/use-library-selection";
import { useLibraryView } from "../../../model/use-library-view";
import { GridSection } from "./grid-section";
import { SaveSection } from "./save-section";
import { SearchSection } from "./search-section";
import { SelectionSection } from "./selection-section";

const NO_ITEMS: readonly SavedDiagram[] = [];

export interface LibraryTabProps {
  readonly source: string;
  readonly profileId: string;
  readonly currentId: string | null;
  readonly onCurrentChange: (id: string | null) => void;
  readonly onOpen: (diagram: SavedDiagram) => void;
}

export function LibraryTab({
  source,
  profileId,
  currentId,
  onCurrentChange,
  onOpen,
}: LibraryTabProps): JSX.Element {
  const { t, language } = useI18n();
  const library = useDiagramLibrary();
  const state = useLibraryView();
  const profiles = useProfiles();
  const { view } = state;
  const scrollRef = useScrollMemory("library", library.items !== undefined);

  const items = library.items ?? NO_ITEMS;
  const current = items.find((item) => item.id === currentId);
  const shown = useMemo(
    () => applyLibraryView(items, view, language),
    [items, view, language],
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const selection = useLibrarySelection(itemIds);
  const matchingIds = useMemo(
    () => filterDiagrams(items, view).map((item) => item.id),
    [items, view],
  );

  function changePage(page: number): void {
    state.setPage(page);
    scrollToTop(scrollRef.current);
  }

  function standardTitle(id: string): string {
    const profile = profiles.find((item) => item.id === id);

    return id === CUSTOM_PROFILE_ID
      ? t("editor.config.custom")
      : (profile?.title ?? id);
  }

  return (
    <DiagramLibrary ref={scrollRef}>
      <SaveSection
        source={source}
        profileId={profileId}
        current={current}
        library={library}
        standardTitle={standardTitle}
        onCurrentChange={onCurrentChange}
      />

      <SearchSection state={state} selection={selection} />

      <SelectionSection
        items={items}
        matchingIds={matchingIds}
        selection={selection}
        currentId={currentId}
        library={library}
        onCurrentChange={onCurrentChange}
      />

      <GridSection
        items={items}
        shown={shown}
        state={state}
        selection={selection}
        library={library}
        profiles={profiles}
        standardTitle={standardTitle}
        currentId={currentId}
        onCurrentChange={onCurrentChange}
        onOpen={onOpen}
      />

      <DiagramLibrary.Pagination
        page={shown.page}
        pageCount={shown.pageCount}
        first={shown.first}
        last={shown.last}
        total={shown.total}
        onPageChange={changePage}
      />
    </DiagramLibrary>
  );
}
