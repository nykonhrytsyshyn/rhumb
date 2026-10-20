import { type JSX, Suspense } from "react";

import { ErrorBoundary } from "@shared/lib/error-boundary";

import { ERROR_SCENES } from "./scenes";

const ActiveScene =
  ERROR_SCENES[Math.floor(Math.random() * ERROR_SCENES.length)];

export function ErrorScreenScene(): JSX.Element | null {
  if (ActiveScene === undefined) {
    return null;
  }

  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <ActiveScene />
      </Suspense>
    </ErrorBoundary>
  );
}
