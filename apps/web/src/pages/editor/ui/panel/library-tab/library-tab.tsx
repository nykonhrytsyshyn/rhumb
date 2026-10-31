import { type JSX, useMemo, useState } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useI18n } from "@shared/i18n";
import { downloadBlob } from "@shared/lib/download-blob";
import { toFileName } from "@shared/lib/to-file-name";
import { Button } from "@shared/ui/button";

import {
  ALL_PROFILES,
  LIBRARY_DATE_FIELDS,
  LIBRARY_PAGE_SIZES,
  LIBRARY_SORTS,
} from "../../../config/library-view";
import {
  applyLibraryView,
  countActiveFilters,
  hasFilterChanges,
  isNarrowed,
} from "../../../lib/library-view";
import { scrollToTop, useScrollMemory } from "../../../lib/use-scroll-memory";
import type { SavedDiagram } from "../../../model/diagram/is-saved-diagram";
import { useDiagramLibrary } from "../../../model/diagram/use-diagram-library";
import { CUSTOM_PROFILE_ID } from "../../../model/profile";
import { useProfiles } from "../../../model/profile/use-profiles";
import { useLibraryView } from "../../../model/use-library-view.ts";
import { DiagramThumbnail } from "../../diagram/diagram-thumbnail";

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
  const profiles = useProfiles();
  const library = useDiagramLibrary();
  const [name, setName] = useState("");
  const state = useLibraryView();
  const { view } = state;
  const scrollRef = useScrollMemory("library", library.items !== undefined);

  const items = library.items ?? NO_ITEMS;
  const current = items.find((item) => item.id === currentId);
  const shown = useMemo(
    () => applyLibraryView(items, view, language),
    [items, view, language],
  );

  const sortOptions = LIBRARY_SORTS.map((sort) => ({
    value: sort,
    label: t(`editor.library.filter.sorts.${sort}`),
  }));
  const dateFieldOptions = LIBRARY_DATE_FIELDS.map((field) => ({
    value: field,
    label: t(`editor.library.filter.dateFields.${field}`),
  }));
  const profileOptions = [
    { value: ALL_PROFILES, label: t("editor.library.filter.allStandards") },
    ...profiles.map((profile) => ({
      value: profile.id,
      label:
        profile.id === CUSTOM_PROFILE_ID
          ? t("editor.config.custom")
          : profile.title,
    })),
  ];
  const pageSizeOptions = LIBRARY_PAGE_SIZES.map((size) => ({
    value: String(size),
    label: String(size),
  }));

  function changePage(page: number): void {
    state.setPage(page);
    scrollToTop(scrollRef.current);
  }

  async function saveAsNew(): Promise<void> {
    const trimmed = name.trim();
    const created = await library.create({
      name: trimmed === "" ? t("editor.library.untitled") : trimmed,
      source,
      profileId,
    });

    if (created !== undefined) {
      setName("");
      onCurrentChange(created.id);
    }
  }

  async function duplicate(diagram: SavedDiagram): Promise<void> {
    await library.duplicate(
      diagram.id,
      t("editor.library.copyName", { name: diagram.name }),
    );
  }

  async function remove(diagram: SavedDiagram): Promise<void> {
    if ((await library.remove(diagram.id)) && diagram.id === currentId) {
      onCurrentChange(null);
    }
  }

  return (
    <DiagramLibrary ref={scrollRef}>
      <DiagramLibrary.SaveForm
        name={name}
        onNameChange={setName}
        onSubmit={() => {
          void saveAsNew();
        }}
        disabled={source.trim() === ""}
      >
        {current === undefined ? null : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void library.update(current.id, {
                source,
                profileId,
              });
            }}
          >
            {t("editor.library.update", { name: current.name })}
          </Button>
        )}
      </DiagramLibrary.SaveForm>

      {library.error === null ? null : (
        <DiagramLibrary.Error message={library.error} />
      )}

      <DiagramLibrary.Search value={view.query} onChange={state.setQuery}>
        <DiagramLibrary.Filter
          activeCount={countActiveFilters(view)}
          changed={hasFilterChanges(view)}
          sort={{
            value: view.sort,
            options: sortOptions,
            onChange: state.setSort,
          }}
          dateField={{
            value: view.dateField,
            options: dateFieldOptions,
            onChange: state.setDateField,
          }}
          range={state.range}
          onRangeChange={state.setRange}
          profile={{
            value: view.profileId ?? ALL_PROFILES,
            options: profileOptions,
            onChange: (value) => {
              state.setProfile(value === ALL_PROFILES ? null : value);
            },
          }}
          pageSize={{
            value: String(view.pageSize),
            options: pageSizeOptions,
            onChange: (value) => {
              state.setPageSize(Number(value));
            },
          }}
          onReset={state.resetFilters}
        />
      </DiagramLibrary.Search>

      {library.items === undefined ? (
        <DiagramLibrary.Loading />
      ) : items.length === 0 ? (
        <DiagramLibrary.Empty />
      ) : shown.total === 0 ? (
        <DiagramLibrary.NoMatches
          {...(isNarrowed(view) ? { onReset: state.resetAll } : {})}
        />
      ) : (
        <DiagramLibrary.Grid>
          {shown.items.map((diagram) => (
            <DiagramLibrary.Card
              key={diagram.id}
              name={diagram.name}
              updatedAt={diagram.updatedAt}
              current={diagram.id === currentId}
              thumbnail={
                <DiagramThumbnail
                  source={diagram.source}
                  profile={
                    profiles.find(
                      (profile) => profile.id === diagram.profileId,
                    ) ?? profiles[0]
                  }
                />
              }
              onOpen={() => {
                onCurrentChange(diagram.id);
                onOpen(diagram);
              }}
              onRename={(next) => {
                void library.update(diagram.id, { name: next });
              }}
              onDuplicate={() => {
                void duplicate(diagram);
              }}
              onDownload={() => {
                downloadBlob(
                  new Blob([diagram.source], {
                    type: "text/plain;charset=utf-8",
                  }),
                  `${toFileName(diagram.name)}.mmd`,
                );
              }}
              onDelete={() => {
                void remove(diagram);
              }}
            />
          ))}
        </DiagramLibrary.Grid>
      )}

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
