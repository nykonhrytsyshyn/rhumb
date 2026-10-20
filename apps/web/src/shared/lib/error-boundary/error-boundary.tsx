import { Component, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  readonly fallback: ReactNode | ((error: unknown) => ReactNode);
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly failed: boolean;
  readonly error: unknown;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { failed: true, error };
  }

  public override state: ErrorBoundaryState = { failed: false, error: null };

  public override render(): ReactNode {
    const { fallback, children } = this.props;
    const { failed, error } = this.state;

    if (!failed) {
      return children;
    }

    return typeof fallback === "function" ? fallback(error) : fallback;
  }
}
