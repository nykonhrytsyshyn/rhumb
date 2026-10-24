import { describe, expect, it } from "vitest";

import { NODE_KINDS } from "@rhumb/kernel";
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

  it("uses every block, frame, decoration and omission somewhere", () => {
    const diagrams = SAMPLES.map((sample) =>
      new FlowchartParser().parse(sample.sources.en),
    );
    const nodes = diagrams.flatMap((diagram) => diagram.nodes);
    const kinds = new Set(nodes.map((node) => node.kind));

    expect([...NODE_KINDS].filter((kind) => !kinds.has(kind))).toEqual([]);
    expect(diagrams.some((diagram) => diagram.groups.length > 1)).toBe(true);
    expect(nodes.some((node) => node.ref !== undefined)).toBe(true);
    expect(nodes.some((node) => (node.stack ?? 1) > 1)).toBe(true);
    expect(nodes.some((node) => node.ident !== undefined)).toBe(true);
    expect(nodes.some((node) => node.desc !== undefined)).toBe(true);
    expect(nodes.some((node) => node.input !== undefined)).toBe(true);
    expect(
      diagrams.some((diagram) => diagram.edges.some((edge) => edge.skip)),
    ).toBe(true);
    expect(
      new Set(diagrams.map((diagram) => diagram.direction)).size,
    ).toBeGreaterThan(1);
  });

  it("has a unique id and a title for every sample", async () => {
    const ids = SAMPLES.map((sample) => sample.id);
    const titles = await import("@shared/i18n/locales/en/editor.json");

    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      expect(titles.default.samples, id).toHaveProperty(id);
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
