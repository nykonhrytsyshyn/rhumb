/** Raised when an optional package that a feature needs is not installed. */
export class MissingDependencyError extends Error {
  public readonly packageName: string;

  public constructor(packageName: string, purpose: string, cause: unknown) {
    super(
      `${purpose} needs the "${packageName}" package: npm install ${packageName}`,
      { cause },
    );
    this.name = "MissingDependencyError";
    this.packageName = packageName;
  }
}

/**
 * Loads a package that is only needed by some features. The name is not a
 * literal on purpose, so bundlers leave it for the user's install to resolve.
 */
export async function loadOptional<T>(
  packageName: string,
  purpose: string,
): Promise<T> {
  try {
    return (await import(packageName)) as T;
  } catch (error) {
    throw new MissingDependencyError(packageName, purpose, error);
  }
}
