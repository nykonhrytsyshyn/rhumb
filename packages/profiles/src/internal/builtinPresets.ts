/** Loads every preset from the `presets` folder without naming any of them. */
export function loadBuiltinPresets(): readonly unknown[] {
  const modules = import.meta.glob<unknown>("../../presets/*.json", {
    eager: true,
    import: "default",
  });

  return Object.values(modules);
}
