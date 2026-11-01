import { createZip } from "@rhumb/agent-kit";

import { toFileName } from "@shared/lib/to-file-name";

import type { SavedDiagram } from "../../model/diagram";

export function zipDiagrams(diagrams: readonly SavedDiagram[]): Uint8Array {
  const used = new Map<string, number>();

  return createZip(
    diagrams.map((diagram) => {
      const base = toFileName(diagram.name);
      const key = base.toLowerCase();
      const count = used.get(key) ?? 0;

      used.set(key, count + 1);

      return {
        path: count === 0 ? `${base}.md` : `${base} (${String(count + 1)}).md`,
        data: diagram.source,
      };
    }),
  );
}
