export interface SavedDiagram {
  readonly id: string;
  readonly name: string;
  readonly source: string;
  readonly profileId: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export function isSavedDiagram(value: unknown): value is SavedDiagram {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.source === "string" &&
    typeof record.profileId === "string" &&
    typeof record.createdAt === "number" &&
    typeof record.updatedAt === "number"
  );
}
