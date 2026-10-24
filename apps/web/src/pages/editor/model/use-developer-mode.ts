import { usePersistedState } from "@shared/lib/use-persisted-state";

const STORAGE_KEY = "rhumb.developerMode";

export interface DeveloperMode {
  readonly enabled: boolean;
  readonly locked: boolean;
  readonly setEnabled: (enabled: boolean) => void;
}

export function useDeveloperMode(): DeveloperMode {
  const locked = process.env.NODE_ENV === "development";
  const [stored, store] = usePersistedState(STORAGE_KEY, "off");

  return {
    enabled: locked || stored === "on",
    locked,
    setEnabled: (enabled) => {
      store(enabled ? "on" : "off");
    },
  };
}
