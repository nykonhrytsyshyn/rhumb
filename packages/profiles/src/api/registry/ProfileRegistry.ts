import { loadBuiltinPresets } from "../../internal/builtinPresets";
import { type StandardProfile, profileSchema } from "../schema";

/** Raised when a profile does not match the schema. */
export class InvalidProfileError extends Error {
  public constructor(public readonly issues: readonly string[]) {
    super(`Invalid profile:\n${issues.join("\n")}`);
    this.name = "InvalidProfileError";
  }
}

export class ProfileRegistry {
  private readonly profiles = new Map<string, StandardProfile>();

  /** Registers a built-in or user-provided profile after validating it. */
  public register(raw: unknown): StandardProfile {
    const result = profileSchema.safeParse(raw);

    if (!result.success) {
      throw new InvalidProfileError(
        result.error.issues.map((issue) => {
          const path = issue.path.map(String).join(".");
          return path === "" ? issue.message : `${path}: ${issue.message}`;
        }),
      );
    }

    this.profiles.set(result.data.id, result.data);

    return result.data;
  }

  public has(id: string): boolean {
    return this.profiles.has(id);
  }

  public get(id: string): StandardProfile {
    const profile = this.profiles.get(id);

    if (profile === undefined) {
      throw new Error(`Unknown profile "${id}"`);
    }

    return profile;
  }

  public list(): readonly StandardProfile[] {
    return [...this.profiles.values()];
  }

  public static withBuiltins(): ProfileRegistry {
    const registry = new ProfileRegistry();

    for (const raw of loadBuiltinPresets()) {
      registry.register(raw);
    }

    return registry;
  }
}
