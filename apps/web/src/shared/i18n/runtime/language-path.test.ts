import { describe, expect, it } from "vitest";

import {
  isEditorPath,
  languageFromPath,
  pathForLanguage,
} from "./language-path";

describe("languageFromPath", () => {
  it("reads a language prefix, with or without a trailing slash", () => {
    expect(languageFromPath("/uk/")).toBe("uk");
    expect(languageFromPath("/uk")).toBe("uk");
  });

  it("leaves the choice open for the root, the default language and others", () => {
    expect(languageFromPath("/")).toBeNull();
    expect(languageFromPath("/en/")).toBeNull();
    expect(languageFromPath("/fr/")).toBeNull();
  });
});

describe("pathForLanguage", () => {
  it("keeps English at the root", () => {
    expect(pathForLanguage("en")).toBe("/");
    expect(pathForLanguage("uk")).toBe("/uk/");
  });
});

describe("isEditorPath", () => {
  it("accepts the root and the language roots only", () => {
    expect(isEditorPath("/")).toBe(true);
    expect(isEditorPath("/uk/")).toBe(true);
    expect(isEditorPath("/uk")).toBe(true);
    expect(isEditorPath("/uk/other")).toBe(false);
    expect(isEditorPath("/docs/")).toBe(false);
    expect(isEditorPath("/nope")).toBe(false);
  });
});
