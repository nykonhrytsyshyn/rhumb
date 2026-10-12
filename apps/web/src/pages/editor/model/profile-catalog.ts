import { ProfileRegistry, type StandardProfile } from "@rhumb/profiles";

/** Observable list of the profiles available in the editor. */
export class ProfileCatalog {
  private readonly registry = ProfileRegistry.withBuiltins();
  private readonly listeners = new Set<() => void>();
  private profiles: readonly StandardProfile[] = this.registry.list();

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public readonly getSnapshot = (): readonly StandardProfile[] => this.profiles;

  /** @throws InvalidProfileError when the profile does not match the schema. */
  public register(raw: unknown): StandardProfile {
    const profile = this.registry.register(raw);
    this.profiles = this.registry.list();

    this.listeners.forEach((listener) => {
      listener();
    });

    return profile;
  }
}

export const profileCatalog = new ProfileCatalog();
