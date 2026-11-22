import { describe, expect, it } from "vitest";

import type { EmbeddedFont } from "./EmbeddedFont";
import { SvgFontEmbedder } from "./SvgFontEmbedder";

const DRAWING =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><g/></svg>';

const GOST: EmbeddedFont = {
  family: "OpenGost Type A",
  data: "QUJD",
  format: "woff2",
  weight: "400",
};

describe("SvgFontEmbedder", () => {
  it("returns the drawing untouched when there is no font to embed", () => {
    expect(new SvgFontEmbedder().embed(DRAWING, [])).toBe(DRAWING);
  });

  it("puts the font face right inside the root element", () => {
    const embedded = new SvgFontEmbedder().embed(DRAWING, [GOST]);

    expect(embedded).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">' +
        "<defs><style>@font-face{font-family:'OpenGost Type A';" +
        "src:url(data:font/woff2;base64,QUJD) format('woff2');" +
        "font-weight:400;font-style:normal;}</style></defs><g/></svg>",
    );
  });

  it("embeds each family once and every format with its own type", () => {
    const embedded = new SvgFontEmbedder().embed(DRAWING, [
      GOST,
      { ...GOST, data: "REVG" },
      { family: "Inter", data: "RA==", format: "woff", weight: "100 900" },
      { family: "Mono", data: "RQ==", format: "truetype", weight: "400" },
    ]);

    expect(embedded.match(/@font-face/g)).toHaveLength(3);
    expect(embedded).not.toContain("REVG");
    expect(embedded).toContain("data:font/woff;base64,RA==) format('woff')");
    expect(embedded).toContain("data:font/ttf;base64,RQ==) format('truetype')");
    expect(embedded).toContain("font-weight:100 900;");
  });

  it("opens an empty drawing to hold the styles", () => {
    const embedded = new SvgFontEmbedder().embed(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
      [GOST],
    );

    expect(embedded.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(
      true,
    );
    expect(embedded.endsWith("</style></defs></svg>")).toBe(true);
    expect(embedded).not.toContain("/>>");
  });

  it("keeps a framed document well-formed by touching its root only", () => {
    const framed =
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect/><svg x="1"><g/></svg></svg>';
    const embedded = new SvgFontEmbedder().embed(framed, [GOST]);

    expect(embedded.match(/<defs>/g)).toHaveLength(1);
    expect(embedded.indexOf("<defs>")).toBeLessThan(
      embedded.indexOf("<rect/>"),
    );
    expect(embedded.endsWith('<rect/><svg x="1"><g/></svg></svg>')).toBe(true);
  });

  it("escapes a family name so that it cannot break out of the style", () => {
    const embedded = new SvgFontEmbedder().embed(DRAWING, [
      { ...GOST, family: "It's </style><g>" },
    ]);

    expect(embedded).toContain("font-family:'It\\'s &lt;/style&gt;&lt;g&gt;'");
    expect(embedded.match(/<\/style>/g)).toHaveLength(1);
  });

  it("refuses something that is not an SVG document", () => {
    expect(() => new SvgFontEmbedder().embed("<div/>", [GOST])).toThrow(
      "Expected a serialized SVG document",
    );
  });
});
