import type { JSX } from "react";

import { EditorPage } from "@pages/editor";

import { ThemeProvider } from "@features/theme";

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <EditorPage />
    </ThemeProvider>
  );
}
