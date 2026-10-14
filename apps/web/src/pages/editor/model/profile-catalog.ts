import { ProfileRegistry, type StandardProfile } from "@rhumb/profiles";

/** Id of the profile the user edits; it is stored in the browser. */
export const CUSTOM_PROFILE_ID = "custom";

export const CUSTOM_PROFILE_STORAGE_KEY = "rhumb:custom-profile";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/**
 * Observable list of the profiles available in the editor: the built-in ones,
 * the default first, followed by one editable custom profile.
 */
export class ProfileCatalog {
  private readonly registry = ProfileRegistry.withBuiltins();
  private readonly listeners = new Set<() => void>();
  private readonly storage: StorageLike;
  private profiles: readonly StandardProfile[];

  public constructor(storage: StorageLike = window.localStorage) {
    this.storage = storage;
    this.registry.register(this.initialCustom());
    this.profiles = this.sorted();
  }

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public readonly getSnapshot = (): readonly StandardProfile[] => this.profiles;

  /**
   * Stores `raw` as the custom profile, whatever id it carries.
   *
   * @throws InvalidProfileError when it does not match the schema.
   */
  public saveCustom(raw: unknown): StandardProfile {
    const checked = new ProfileRegistry().register(raw);
    const custom = this.registry.register({
      ...checked,
      id: CUSTOM_PROFILE_ID,
      default: false,
    });

    this.persist(custom);
    this.profiles = this.sorted();
    this.listeners.forEach((listener) => {
      listener();
    });

    return custom;
  }

  /** The stored custom profile, or a copy of the default one. */
  private initialCustom(): StandardProfile {
    try {
      const stored = this.storage.getItem(CUSTOM_PROFILE_STORAGE_KEY);

      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        const checked = new ProfileRegistry().register(parsed);

        return { ...checked, id: CUSTOM_PROFILE_ID, default: false };
      }
    } catch {
      // A damaged or unreadable value falls back to the default copy
    }

    const [fallback] = [...this.registry.list()].sort(
      (a, b) => Number(b.default) - Number(a.default),
    );

    if (fallback === undefined) {
      throw new Error("No built-in profile to start the custom one from");
    }

    return {
      ...fallback,
      id: CUSTOM_PROFILE_ID,
      title: "Custom",
      description: "",
      default: false,
    };
  }

  private persist(profile: StandardProfile): void {
    try {
      this.storage.setItem(CUSTOM_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Without storage the custom profile only lasts for this session
    }
  }

  private sorted(): readonly StandardProfile[] {
    const all = this.registry.list();
    const builtIn = all
      .filter((profile) => profile.id !== CUSTOM_PROFILE_ID)
      .sort((a, b) => Number(b.default) - Number(a.default));

    return [
      ...builtIn,
      ...all.filter((profile) => profile.id === CUSTOM_PROFILE_ID),
    ];
  }
}

export const profileCatalog = new ProfileCatalog();
