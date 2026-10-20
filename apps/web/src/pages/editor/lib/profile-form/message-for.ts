import type { TranslationKey } from "@shared/i18n";

export function messageFor(issue: {
  readonly code: string;
  readonly origin?: unknown;
  readonly inclusive?: unknown;
}): TranslationKey {
  if (issue.code === "invalid_type") {
    return "editor.config.errors.number";
  }

  if (issue.code === "too_small" && issue.origin === "string") {
    return "editor.config.errors.required";
  }

  if (issue.code === "too_small") {
    return issue.inclusive === true
      ? "editor.config.errors.notNegative"
      : "editor.config.errors.positive";
  }

  return "editor.config.errors.invalid";
}
