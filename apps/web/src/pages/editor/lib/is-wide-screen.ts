const WIDE_SCREEN = "(min-width: 768px)";

export function isWideScreen(): boolean {
  return (
    typeof window.matchMedia !== "function" ||
    window.matchMedia(WIDE_SCREEN).matches
  );
}
