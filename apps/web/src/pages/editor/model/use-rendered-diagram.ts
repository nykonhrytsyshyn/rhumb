import { useEffect, useState } from "react";

import type { Size } from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

import { renderDiagram } from "../api/render-diagram";

export interface RenderState {
  /** Last successfully rendered SVG, kept while a newer render is pending. */
  readonly svg: string | null;
  readonly size: Size | null;
  readonly error: string | null;
  /** True while the shown result does not match the latest input. */
  readonly pending: boolean;
}

interface Settled {
  readonly key: string;
  readonly svg: string | null;
  readonly size: Size | null;
  readonly error: string | null;
}

const EMPTY: Settled = { key: "", svg: null, size: null, error: null };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useRenderedDiagram(
  source: string,
  profile: StandardProfile | undefined,
  delayMs = 250,
): RenderState {
  const [settled, setSettled] = useState<Settled>(EMPTY);
  const key = profile === undefined ? "" : `${profile.id}\n${source}`;

  useEffect(() => {
    if (profile === undefined) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      renderDiagram(source, profile).then(
        (result) => {
          if (cancelled) {
            return;
          }

          setSettled({ key, svg: result.svg, size: result.size, error: null });
        },
        (error: unknown) => {
          if (cancelled) {
            return;
          }

          setSettled((previous) => ({
            ...previous,
            key,
            error: messageOf(error),
          }));
        },
      );
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, profile, key, delayMs]);

  return {
    svg: settled.svg,
    size: settled.size,
    error: settled.error,
    pending: profile !== undefined && settled.key !== key,
  };
}
