import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { RuleTester } from "eslint";
import { afterAll, describe, it } from "vitest";

import { fsdLogic } from "./fsd-logic";

RuleTester.describe = describe;
RuleTester.it = it;

const FILES = [
  "src/shared/ui/button/index.ts",
  "src/shared/ui/button/button.tsx",
  "src/shared/lib/cn/index.ts",
  "src/shared/lib/hooks/index.ts",
  "src/app/providers/index.ts",
  "src/widgets/source-editor/index.ts",
  "src/widgets/other/index.ts",
  "src/pages/editor/index.ts",
];

const root = fs.mkdtempSync(path.join(os.tmpdir(), "fsd-plugin-"));

for (const file of FILES) {
  const target = path.join(root, file);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, "");
}

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

const at = (file: string) => path.join(root, "src", file);
const ok = (file: string, source: string) => ({
  code: `import x from "${source}";`,
  filename: at(file),
});
const bad = (file: string, source: string, messageId: string) => ({
  ...ok(file, source),
  errors: [{ messageId }],
});

new RuleTester({
  languageOptions: { sourceType: "module" },
}).run("fsd-logic", fsdLogic, {
  valid: [
    ok("pages/editor/ui/a.tsx", "react"),
    ok("pages/editor/ui/a.tsx", "@rhumb/engine"),
    ok("pages/editor/ui/a.tsx", "@widgets/source-editor"),
    ok("pages/editor/ui/a.tsx", "@shared/ui/button"),
    ok("pages/editor/ui/a.tsx", "@shared/lib/cn"),
    ok("pages/editor/ui/a.tsx", "@shared/ui/index"),
    ok("pages/editor/ui/a.tsx", "@shared/lib/hooks"),
    ok("shared/ui/button/a.tsx", "@shared/lib/cn"),
    ok("app/main.tsx", "@pages/editor"),
  ],
  invalid: [
    bad("shared/lib/a.ts", "@pages/editor", "layerHierarchy"),
    bad("widgets/source-editor/a.ts", "@app/providers", "layerHierarchy"),
    bad("widgets/source-editor/a.ts", "@widgets/other", "crossSlice"),
    bad("pages/editor/a.ts", "@widgets/source-editor/lib/x", "publicApi"),
    bad("pages/editor/a.ts", "@shared/lib/missing/x", "publicApi"),
    bad("pages/editor/a.ts", "@shared/ui/button/button", "publicApi"),
  ],
});
