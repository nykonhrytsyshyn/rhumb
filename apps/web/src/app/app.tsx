import { type JSX, useEffect, useState } from "react";

import { EditorPage } from "@pages/editor";
import { NotFoundPage } from "@pages/not-found";

import { ThemeProvider } from "@features/theme";

import { TooltipProvider } from "@shared/ui/tooltip";

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
      <TooltipProvider delay={300}>
        {isNotFound ? <NotFoundPage /> : <EditorPage />}
      </TooltipProvider>
    </ThemeProvider>
  );
}
