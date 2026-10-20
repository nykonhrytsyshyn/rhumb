import { type JSX, useEffect, useState } from "react";

import { EditorPage } from "@pages/editor";
import { NotFoundPage } from "@pages/not-found";

import { ThemeProvider } from "@features/theme";

export function App(): JSX.Element {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = (): void => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const isNotFound = pathname !== "/";

  return (
    <ThemeProvider>
      {isNotFound ? <NotFoundPage /> : <EditorPage />}
    </ThemeProvider>
  );
}
