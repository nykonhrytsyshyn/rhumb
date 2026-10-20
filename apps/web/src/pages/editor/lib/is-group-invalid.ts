import type { TranslationKey } from "@shared/i18n";

import { GROUP_PATHS } from "../config/group-paths";
import type { ParsedForm } from "./profile-form";

export function isGroupInvalid(
  group: string,
  parsed: ParsedForm,
  generalKey: TranslationKey | undefined,
): boolean {
  const prefixes = GROUP_PATHS[group] ?? [];
  const fieldProblem = [...parsed.errors.keys()].some((path) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(prefix)),
  );

  return (
    fieldProblem ||
    (generalKey !== undefined && parsed.general.includes(generalKey))
  );
}
