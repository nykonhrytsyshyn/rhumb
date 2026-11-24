import process from "node:process";

import { run } from "./cli";
import type { Environment } from "./io";

declare const __AGENT_SOURCES__: Readonly<Record<string, string>>;
declare const __VERSION__: string;

function isTty(stream: { readonly isTTY?: boolean }): boolean {
  return stream.isTTY ?? false;
}

async function readStdin(): Promise<Uint8Array> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk as Uint8Array));
  }

  return Buffer.concat(chunks);
}

const environment: Environment = {
  version: __VERSION__,
  agentSources: () => __AGENT_SOURCES__,
  io: {
    readStdin,
    stdinIsTty: isTty(process.stdin),
    stdoutIsTty: isTty(process.stdout),
    writeStdout: (data) => process.stdout.write(data),
    writeStderr: (text) => process.stderr.write(text),
  },
};

process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code !== "EPIPE") {
    throw error;
  }
});

process.exitCode = await run(process.argv.slice(2), environment);
