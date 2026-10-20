import {
  IconBook,
  IconBookmarks,
  IconCode,
  IconSettings,
} from "@tabler/icons-react";

import type { TranslationKey } from "@shared/i18n";

export const EDITOR_TABS = [
  { value: "code", labelKey: "common.tabs.code", icon: IconCode },
  { value: "library", labelKey: "common.tabs.library", icon: IconBookmarks },
  { value: "docs", labelKey: "common.tabs.docs", icon: IconBook },
  { value: "config", labelKey: "common.tabs.config", icon: IconSettings },
] as const satisfies readonly {
  readonly value: string;
  readonly labelKey: TranslationKey;
  readonly icon: unknown;
}[];
