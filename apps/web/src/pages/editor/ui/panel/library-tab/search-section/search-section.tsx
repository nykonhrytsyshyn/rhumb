import type { JSX } from "react";

import { DiagramLibrary } from "@widgets/diagram-library";

import { useT } from "@shared/i18n";

import {
  ALL_PROFILES,
  LIBRARY_DATE_FIELDS,
  LIBRARY_PAGE_SIZES,
  LIBRARY_SORTS,
} from "../../../../config/library-view";
import {
  countActiveFilters,
  hasFilterChanges,
} from "../../../../lib/library-view";
import { CUSTOM_PROFILE_ID, useProfiles } from "../../../../model/profile";
import type { LibrarySelection } from "../../../../model/use-library-selection";
import type { LibraryViewState } from "../../../../model/use-library-view";

export interface SearchSectionProps {
  readonly state: LibraryViewState;
  readonly selection: LibrarySelection;
}

export function SearchSection({
  state,
  selection,
}: SearchSectionProps): JSX.Element {
  const t = useT();
  const profiles = useProfiles();
  const { view } = state;

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

  return (
    <DiagramLibrary.Search value={view.query} onChange={state.setQuery}>
      <DiagramLibrary.SelectToggle
        active={selection.active}
        onActiveChange={selection.setActive}
      />

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
  );
}
