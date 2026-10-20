import { type JSX, Suspense, lazy } from "react";

import type { SourceEditorProps } from "./source-editor";

const LazySourceEditor = lazy(() => import("./source-editor"));

export function SourceEditor(props: SourceEditorProps): JSX.Element {
  return (
    <Suspense fallback={null}>
      <LazySourceEditor {...props} />
    </Suspense>
  );
}
