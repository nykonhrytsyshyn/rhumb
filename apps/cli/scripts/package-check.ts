import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSER_ONLY =
  /\b(?:document\.(?:body|head|fonts|create\w+|query\w+|get\w+)|window\.\w|navigator\.\w|OffscreenCanvas|HTMLCanvasElement|createImageBitmap|new Image\(|new FontFace\(|localStorage|sessionStorage)/;

function assertNoBrowserCode(): void {
  const dist = new URL("../dist/", import.meta.url);

  for (const file of readdirSync(dist).filter((name) =>
    name.endsWith(".mjs"),
  )) {
    const found = BROWSER_ONLY.exec(readFileSync(new URL(file, dist), "utf8"));

    if (found !== null) {
      throw new Error(`dist/${file} uses the browser: "${found[0]}"`);
    }
  }
}

assertNoBrowserCode();

const folder = mkdtempSync(join(tmpdir(), "rhumb-pack-"));

function run(args: readonly string[]): void {
  execFileSync("pnpm", [...args], { stdio: "inherit", shell: true });
}

try {
  run(["pack", "--pack-destination", JSON.stringify(folder)]);

  const [tarball] = readdirSync(folder).filter((file) => file.endsWith(".tgz"));

  if (tarball === undefined) {
    throw new Error("pnpm pack did not produce a tarball");
  }

  const path = JSON.stringify(join(folder, tarball));

  run(["exec", "publint", "--strict", path]);
} finally {
  rmSync(folder, { recursive: true, force: true });
}
