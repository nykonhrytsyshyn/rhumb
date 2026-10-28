import { useCallback, useMemo } from "react";

import { usePersistedState } from "@shared/lib/use-persisted-state";

import {
  DOCS_DEFAULT_OPEN,
  DOCS_SECTION_IDS,
  type DocsSectionId,
} from "../config/docs-sections";
import { DOCS_OPEN_KEY } from "../config/storage-keys";

function isSectionId(value: unknown): value is DocsSectionId {
  return (
    typeof value === "string" &&
    (DOCS_SECTION_IDS as readonly string[]).includes(value)
  );
}

export function parseOpenSections(raw: string): readonly DocsSectionId[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(isSectionId)
      : DOCS_DEFAULT_OPEN;
  } catch {
    return DOCS_DEFAULT_OPEN;
  }
}

export function useDocsState(): {
  readonly open: readonly DocsSectionId[];
  readonly setOpen: (open: readonly string[]) => void;
} {
  const [raw, setRaw] = usePersistedState(
    DOCS_OPEN_KEY,
    JSON.stringify(DOCS_DEFAULT_OPEN),
  );
  const open = useMemo(() => parseOpenSections(raw), [raw]);
  const setOpen = useCallback(
    (next: readonly string[]) => {
      setRaw(JSON.stringify(next.filter(isSectionId)));
    },
    [setRaw],
  );

  return { open, setOpen };
}
