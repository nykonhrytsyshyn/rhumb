import type { LineScanner } from "./LineScanner";

/** Keys accepted inside `@{ ... }`. */
export const PROP_KEYS = [
  "shape",
  "label",
  "ident",
  "desc",
  "input",
  "ref",
  "stack",
  "loop",
  "side",
  "legend",
] as const;

export type PropKey = (typeof PROP_KEYS)[number];

export type NodeProps = Partial<Record<PropKey, string>>;

const KEY = /[A-Za-z][\w-]*/;

function isKey(raw: string): raw is PropKey {
  return (PROP_KEYS as readonly string[]).includes(raw);
}

/**
 * Reads `@{ key: value, key: "quoted value" }` at the cursor. Values are
 * quoted, or bare up to the next comma.
 */
export function readProps(scanner: LineScanner): NodeProps {
  scanner.consume("@{");

  const props: Partial<Record<PropKey, string>> = {};

  for (;;) {
    scanner.skipSeparators();

    if (scanner.startsWith("}")) {
      scanner.consume("}");

      return props;
    }

    if (scanner.atEnd) {
      scanner.fail('Missing closing "}" of @{ ... }');
    }

    const key = scanner.match(KEY)?.[0];

    if (key === undefined) {
      scanner.fail("Expected a key inside @{ ... }");
    }

    if (!isKey(key)) {
      scanner.fail(
        `Unknown key "${key}" in @{ ... }; expected one of ${PROP_KEYS.join(", ")}`,
      );
    }

    if (key in props) {
      scanner.fail(`Key "${key}" is given twice`);
    }

    scanner.skipSpaces();

    if (!scanner.startsWith(":")) {
      scanner.fail(`Expected ":" after "${key}"`);
    }

    scanner.consume(":");
    props[key] = scanner.readValue();
  }
}
