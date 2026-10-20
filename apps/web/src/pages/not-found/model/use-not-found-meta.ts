import { useEffect } from "react";

export function useNotFoundMeta(title: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.createElement("meta");

    robots.name = "robots";
    robots.content = "noindex";
    document.head.append(robots);
    document.title = title;

    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, [title]);
}
