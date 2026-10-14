import { useCallback, useMemo, useState } from "react";

import type { StandardProfile } from "@rhumb/profiles";

import { usePersistedState } from "@shared/lib/use-persisted-state";

import {
  type FormState,
  type ParsedForm,
  parseForm,
  toFormState,
  writeField,
} from "../lib/profile-form";
import {
  CUSTOM_PROFILE_ID,
  type ProfileCatalog,
  profileCatalog,
} from "./profile-catalog";
import { useProfiles } from "./use-profiles";

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
  /** The profile chosen in the list, as saved. */
  readonly selected: StandardProfile;
  /** What the drawing uses: the chosen profile with valid edits applied. */
  readonly active: StandardProfile;
  readonly values: FormState;
  readonly parsed: ParsedForm;
  /** True for the custom profile, the only one whose values can change. */
  readonly editable: boolean;
  /** True when the form differs from the saved profile. */
  readonly dirty: boolean;
  readonly select: (id: string) => void;
  readonly update: (path: string, value: string) => void;
  /** Stores the form as the custom profile; false when it is not valid. */
  readonly save: () => boolean;
  readonly reset: () => void;
  /** Replaces the custom profile with one read from a file and selects it. */
  readonly importProfile: (raw: unknown) => StandardProfile;
}

/**
 * State of the standard picker and of the form that edits the custom
 * standard. Edits are drawn straight away and kept only after saving.
 */
export function useProfileEditor(
  catalog: ProfileCatalog = profileCatalog,
): ProfileEditor {
  const profiles = useProfiles(catalog);
  const [storedId, setStoredId] = usePersistedState(PROFILE_KEY, "");
  const [edit, setEdit] = useState<Edit | undefined>(undefined);

  const selected =
    profiles.find((profile) => profile.id === storedId) ??
    profiles.find((profile) => profile.default) ??
    profiles[0];

  if (selected === undefined) {
    throw new Error("The profile catalog is empty");
  }

  // An edit belongs to the saved profile it started from. It survives looking
  // at another standard, and is dropped once that profile is saved or replaced.
  const current = edit?.base === selected ? edit : undefined;
  const values = useMemo(
    () => current?.values ?? toFormState(selected),
    [current, selected],
  );
  const parsed = useMemo(() => parseForm(values, selected), [values, selected]);
  const editable = selected.id === CUSTOM_PROFILE_ID;

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

    catalog.saveCustom(parsed.profile);

    return true;
  }, [catalog, editable, parsed.profile]);

  const importProfile = useCallback(
    (raw: unknown): StandardProfile => {
      const saved = catalog.saveCustom(raw);

      setStoredId(CUSTOM_PROFILE_ID);

      return saved;
    },
    [catalog, setStoredId],
  );

  return {
    profiles,
    selected,
    active: editable ? (current?.valid ?? selected) : selected,
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
    importProfile,
  };
}
