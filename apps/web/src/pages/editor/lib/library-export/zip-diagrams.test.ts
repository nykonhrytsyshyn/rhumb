import { describe, expect, it } from "vitest";

import type { SavedDiagram } from "../../model/diagram/is-saved-diagram";
import { zipDiagrams } from "./zip-diagrams";

function saved(id: string, name: string): SavedDiagram {
  return {
    id,
    name,
    source: `flowchart TD\n${id} --> B`,
    profileId: "iso",
    createdAt: 1,
    updatedAt: 1,
  };
}

function namesIn(zip: Uint8Array): string[] {
  const text = new TextDecoder("latin1").decode(zip);

  return [...text.matchAll(/[\w ()-]+\.md/g)].map((match) => match[0]);
}

describe("zipDiagrams", () => {
  it("puts every source into a .md file", () => {
    const zip = zipDiagrams([saved("a", "One"), saved("b", "Two")]);

    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    expect(new Set(namesIn(zip))).toEqual(new Set(["One.md", "Two.md"]));
  });

  it("numbers files that would have the same name", () => {
    const zip = zipDiagrams([
      saved("a", "Same"),
      saved("b", "same"),
      saved("c", "Same"),
    ]);

    expect(new Set(namesIn(zip))).toEqual(
      new Set(["Same.md", "same (2).md", "Same (3).md"]),
    );
  });

  it("makes unsafe names safe", () => {
    const zip = zipDiagrams([saved("a", "a/b:c")]);

    expect(namesIn(zip)).toContain("a-b-c.md");
  });
});
