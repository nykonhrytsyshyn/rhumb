import type { FormState } from "./types";

export function writeField(
  state: FormState,
  path: string,
  value: string,
): FormState {
  const [head, ...rest] = path.split(".");

  if (head === undefined) {
    return state;
  }

  if (rest.length === 0) {
    return { ...state, [head]: value };
  }

  const child = state[head];

  return {
    ...state,
    [head]: writeField(
      typeof child === "object" ? child : {},
      rest.join("."),
      value,
    ),
  };
}
