import { useCallback, useMemo, useState } from "react";

import type { StandardProfile } from "@rhumb/profiles";

import { usePersistedState } from "@shared/lib/use-persisted-state";

import {
  type FormState,
  type ParsedForm,
  parseForm,
  toFormState,
  writeField,
} from "../../lib/profile-form";
import type { TitleIssue } from "./check-title";
import { type ProfileCatalog, profileCatalog } from "./profile-catalog";
import { useProfileGroups } from "./use-profile-groups";

export const PROFILE_KEY = "rhumb:profile";

interface Edit {
  /** The saved profile the edit started from. */
  readonly base: StandardProfile;
  readonly values: FormState;
  /** The last version of the form that was valid. */
  readonly valid: StandardProfile | undefined;
}

export interface ProfileEditor {
  readonly profiles: readonly StandardProfile[];
  readonly builtIn: readonly StandardProfile[];
  readonly custom: readonly StandardProfile[];
  readonly selected: StandardProfile;
  readonly active: StandardProfile;
  readonly values: FormState;
  readonly parsed: ParsedForm;
  readonly editable: boolean;
  readonly dirty: boolean;
  readonly select: (id: string) => void;
  readonly update: (path: string, value: string) => void;
  readonly save: () => boolean;
  readonly reset: () => void;
  readonly titleIssue: (
    title: string,
    exceptId?: string,
  ) => TitleIssue | undefined;
  readonly uniqueTitle: (title: string) => string;
  /** Adds a custom standard copied from `baseId` and switches to it. */
  readonly create: (title: string, baseId: string) => StandardProfile;
  readonly rename: (title: string) => void;
  /** Drops a custom standard; `replacementId` is chosen if it was in use. */
  readonly remove: (id: string, replacementId: string) => void;
  readonly importProfile: (raw: unknown) => StandardProfile;
}

export function useProfileEditor(
  catalog: ProfileCatalog = profileCatalog,
): ProfileEditor {
  const { all: profiles, builtIn, custom } = useProfileGroups(catalog);
  const [storedId, setStoredId] = usePersistedState(PROFILE_KEY, "");
  const [edit, setEdit] = useState<Edit | undefined>(undefined);

  const selected =
    profiles.find((profile) => profile.id === storedId) ??
    profiles.find((profile) => profile.default) ??
    profiles[0];

  if (selected === undefined) {
    throw new Error("The profile catalog is empty");
  }

  const current = edit?.base === selected ? edit : undefined;
  const values = useMemo(
    () => current?.values ?? toFormState(selected),
    [current, selected],
  );
  const parsed = useMemo(() => parseForm(values, selected), [values, selected]);
  const editable = custom.some((profile) => profile.id === selected.id);
  const active = editable ? (current?.valid ?? selected) : selected;

  const update = useCallback(
    (path: string, value: string) => {
      setEdit((previous) => {
        const previousOfThis =
          previous?.base === selected ? previous : undefined;
        const next = writeField(
          previousOfThis?.values ?? toFormState(selected),
          path,
          value,
        );

        return {
          base: selected,
          values: next,
          valid: parseForm(next, selected).profile ?? previousOfThis?.valid,
        };
      });
    },
    [selected],
  );

  const save = useCallback((): boolean => {
    if (!editable || parsed.profile === undefined) {
      return false;
    }

    catalog.update(selected.id, parsed.profile);

    return true;
  }, [catalog, editable, parsed.profile, selected.id]);

  const create = useCallback(
    (title: string, baseId: string): StandardProfile => {
      const base =
        baseId === selected.id
          ? active
          : (profiles.find((profile) => profile.id === baseId) ?? selected);
      const created = catalog.create(base, title);

      setStoredId(created.id);

      return created;
    },
    [active, catalog, profiles, selected, setStoredId],
  );

  const rename = useCallback(
    (title: string) => {
      const renamed = catalog.rename(selected.id, title);

      setEdit((previous) =>
        previous?.base === selected
          ? {
              base: renamed,
              values: previous.values,
              valid:
                previous.valid === undefined
                  ? undefined
                  : { ...previous.valid, title: renamed.title },
            }
          : previous,
      );
    },
    [catalog, selected],
  );

  const remove = useCallback(
    (id: string, replacementId: string) => {
      catalog.remove(id);

      if (selected.id === id) {
        setStoredId(replacementId);
      }
    },
    [catalog, selected.id, setStoredId],
  );

  const importProfile = useCallback(
    (raw: unknown): StandardProfile => {
      const imported = catalog.importProfile(raw);

      setStoredId(imported.id);

      return imported;
    },
    [catalog, setStoredId],
  );

  return {
    profiles,
    builtIn,
    custom,
    selected,
    active,
    values,
    parsed,
    editable,
    dirty:
      editable &&
      current !== undefined &&
      JSON.stringify(current.values) !== JSON.stringify(toFormState(selected)),
    select: setStoredId,
    update,
    save,
    reset: () => {
      setEdit(undefined);
    },
    titleIssue: (title, exceptId) => catalog.titleIssue(title, exceptId),
    uniqueTitle: (title) => catalog.uniqueTitle(title),
    create,
    rename,
    remove,
    importProfile,
  };
}
