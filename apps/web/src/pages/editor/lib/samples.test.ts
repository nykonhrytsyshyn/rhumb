import { describe, expect, it } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";
import { FlowchartParser } from "@rhumb/source-mermaid";

import { SUPPORTED_LANGUAGES } from "@shared/i18n";

import { SAMPLES } from "../config/samples";
import { sampleSource } from "./sample-source";
import { translateSample } from "./translate-sample";

describe("samples", () => {
  it("parses in every language", () => {
    const parser = new FlowchartParser();

    for (const sample of SAMPLES) {
      for (const language of SUPPORTED_LANGUAGES) {
        expect(() => parser.parse(sample.sources[language])).not.toThrow();
      }
    }
  });

  it("keeps the same structure in every language", () => {
    const parser = new FlowchartParser();

    for (const sample of SAMPLES) {
      const shapes = SUPPORTED_LANGUAGES.map((language) =>
        parser
          .parse(sample.sources[language])
          .nodes.map((node) => `${node.id}:${node.kind}`),
      );

      expect(new Set(shapes.map((list) => list.join())).size).toBe(1);
    }
  });

  it("finds a sample by id", () => {
    expect(sampleSource("linear", "en")).toContain("flowchart TD");
    expect(ProfileRegistry.withBuiltins().list().length).toBeGreaterThan(0);
  });

  it("rejects an unknown id", () => {
    expect(() => sampleSource("nope" as never, "en")).toThrow(/Unknown sample/);
  });

  it("translates an untouched sample to another language", () => {
    expect(translateSample(sampleSource("linear", "en"), "uk")).toBe(
      sampleSource("linear", "uk"),
    );
    expect(translateSample(sampleSource("linear", "uk"), "en")).toBe(
      sampleSource("linear", "en"),
    );
  });

  it("leaves edited sources and the current language alone", () => {
    expect(translateSample("flowchart TD\nA --> B", "uk")).toBeUndefined();
    expect(translateSample(sampleSource("linear", "en"), "en")).toBeUndefined();
  });
});
