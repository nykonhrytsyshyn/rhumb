import type { ESLint } from "eslint";

import { fsdLogic } from "./fsd-logic";

const plugin: ESLint.Plugin = {
  meta: { name: "@rhumb/eslint-plugin-fsd" },
  rules: { "fsd-logic": fsdLogic },
};

export default plugin;
export { fsdLogic } from "./fsd-logic";
