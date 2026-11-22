import { ProfileRegistry, type StandardProfile } from "@rhumb/profiles";

import {
  CUSTOM_PROFILES_KEY,
  LEGACY_CUSTOM_PROFILE_KEY,
} from "../../config/storage-keys";
import { type TitleIssue, checkTitle } from "./check-title";
import { InvalidProfileTitleError } from "./invalid-profile-title-error";
import type { ProfileSnapshot } from "./profile-snapshot";
import { uniqueTitle } from "./unique-title";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const FALLBACK_TITLE = "Custom";

function defaultCreateId(): string {
  return `custom-${crypto.randomUUID()}`;
}

/**
 * The standards the editor can draw with: the built-in ones, which never
 * change, and any number of custom ones that the person creates, edits and
 * deletes. Custom standards live in localStorage.
 */
export class ProfileCatalog {
  private readonly builtIn: readonly StandardProfile[];
  private readonly listeners = new Set<() => void>();
  private readonly storage: StorageLike;
  private readonly createId: () => string;
  private custom: readonly StandardProfile[];
  private snapshot: ProfileSnapshot;

  public constructor(
    storage: StorageLike = window.localStorage,
    createId: () => string = defaultCreateId,
  ) {
    this.storage = storage;
    this.createId = createId;
    this.builtIn = [...ProfileRegistry.withBuiltins().list()].sort(
      (a, b) => Number(b.default) - Number(a.default),
    );
    this.custom = this.restore();
    this.snapshot = this.buildSnapshot();
  }

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public readonly getSnapshot = (): ProfileSnapshot => this.snapshot;

  /** What is wrong with a name, if anything; `exceptId` is the one being renamed. */
  public titleIssue(title: string, exceptId?: string): TitleIssue | undefined {
    return checkTitle(title, this.titlesExcept(exceptId));
  }

  /** The wished name, or the closest one that is free. */
  public uniqueTitle(title: string): string {
    return uniqueTitle(title, this.titlesExcept(undefined));
  }

  /** Adds a custom standard that starts as a copy of `base`. */
  public create(base: StandardProfile, title: string): StandardProfile {
    return this.add({
      ...base,
      id: this.createId(),
      title: this.accept(title),
    });
  }

  /** Adds a custom standard from a loaded file; a taken name gets a number. */
  public importProfile(raw: unknown): StandardProfile {
    const checked = new ProfileRegistry().register(raw);

    return this.add({
      ...checked,
      id: this.createId(),
      title: this.uniqueTitle(checked.title),
    });
  }

  /** Replaces the values of a custom standard; its name stays as it was. */
  public update(id: string, raw: unknown): StandardProfile {
    const existing = this.requireCustom(id);
    const checked = new ProfileRegistry().register(raw);
    const updated: StandardProfile = {
      ...checked,
      id,
      title: existing.title,
      description: existing.description,
      default: false,
    };

    this.commit(
      this.custom.map((profile) => (profile.id === id ? updated : profile)),
    );

    return updated;
  }

  public rename(id: string, title: string): StandardProfile {
    const existing = this.requireCustom(id);
    const renamed = { ...existing, title: this.accept(title, id) };

    this.commit(
      this.custom.map((profile) => (profile.id === id ? renamed : profile)),
    );

    return renamed;
  }

  public remove(id: string): void {
    this.requireCustom(id);
    this.commit(this.custom.filter((profile) => profile.id !== id));
  }

  private add(raw: StandardProfile): StandardProfile {
    const checked = new ProfileRegistry().register({ ...raw, default: false });

    this.commit([...this.custom, checked]);

    return checked;
  }

  private accept(title: string, exceptId?: string): string {
    const issue = this.titleIssue(title, exceptId);

    if (issue !== undefined) {
      throw new InvalidProfileTitleError(issue);
    }

    return title.trim();
  }

  private requireCustom(id: string): StandardProfile {
    const found = this.custom.find((profile) => profile.id === id);

    if (found === undefined) {
      throw new Error(`"${id}" is not a custom standard`);
    }

    return found;
  }

  private titlesExcept(exceptId: string | undefined): readonly string[] {
    return [...this.builtIn, ...this.custom]
      .filter((profile) => profile.id !== exceptId)
      .map((profile) => profile.title);
  }

  private commit(custom: readonly StandardProfile[]): void {
    this.custom = custom;
    this.persist(custom);
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((listener) => {
      listener();
    });
  }

  private buildSnapshot(): ProfileSnapshot {
    return {
      all: [...this.builtIn, ...this.custom],
      builtIn: this.builtIn,
      custom: this.custom,
    };
  }

  private restore(): readonly StandardProfile[] {
    const stored = this.read(CUSTOM_PROFILES_KEY);

    if (stored !== null) {
      return this.sanitize(this.parse(stored));
    }

    return this.migrateLegacy();
  }

  /**
   * Before there could be several custom standards there was only one, with the
   * fixed id "custom". It keeps that id so that the diagrams saved with it still
   * find their standard.
   */
  private migrateLegacy(): readonly StandardProfile[] {
    const legacy = this.read(LEGACY_CUSTOM_PROFILE_KEY);

    if (legacy === null) {
      return [];
    }

    const migrated = this.sanitize(this.parse(legacy));

    if (migrated.length > 0) {
      this.persist(migrated);
    }

    try {
      this.storage.removeItem(LEGACY_CUSTOM_PROFILE_KEY);
    } catch {
      // A value that cannot be removed is ignored from now on anyway
    }

    return migrated;
  }

  private parse(text: string): readonly unknown[] {
    try {
      const parsed: unknown = JSON.parse(text);

      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  /** Keeps what is valid, with names and ids that cannot clash. */
  private sanitize(items: readonly unknown[]): readonly StandardProfile[] {
    const ids = new Set(this.builtIn.map((profile) => profile.id));
    const titles = this.builtIn.map((profile) => profile.title);
    const kept: StandardProfile[] = [];

    for (const item of items) {
      try {
        const checked = new ProfileRegistry().register(item);

        if (ids.has(checked.id)) {
          continue;
        }

        const title = uniqueTitle(
          checked.title === "" ? FALLBACK_TITLE : checked.title,
          titles,
        );

        ids.add(checked.id);
        titles.push(title);
        kept.push({ ...checked, title, default: false });
      } catch {
        // A damaged entry is dropped without touching the others
      }
    }

    return kept;
  }

  private read(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  private persist(custom: readonly StandardProfile[]): void {
    try {
      this.storage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(custom));
    } catch {
      // Without storage the custom standards only last for this session
    }
  }
}

export const profileCatalog = new ProfileCatalog();
