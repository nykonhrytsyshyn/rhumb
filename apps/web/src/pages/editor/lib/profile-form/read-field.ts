import type { FormState, FormTree } from "./types";

export function readField(state: FormState, path: string): string {
  let node: string | FormTree | undefined = state;

  for (const part of path.split(".")) {
    node = typeof node === "object" ? node[part] : undefined;
  }

  return typeof node === "string" ? node : "";
}
