import { Component, type ErrorInfo, type ReactNode } from "react";

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** Custom fallback UI. Receives the error and a retry function. */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  /** Called when an error is caught (e.g. for logging/reporting). */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  error: Error | null;
};

/**
 * React Error Boundary.
 *
 * Catches render errors in its subtree and displays a fallback UI
 * instead of crashing the entire application (white screen).
 *
 * Provides a "Retry" mechanism that resets the error state and
 * re-renders the children.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
    this.props.onError?.(error, info);
  }

  /** Reset the error state so children re-render. */
  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <DefaultFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// ── Default fallback ────────────────────────────────────────────

function DefaultFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        padding: 24,
        margin: 16,
        border: "1px solid #ff4d4f",
        borderRadius: 8,
        backgroundColor: "#fff2f0",
        textAlign: "center",
      }}
    >
      <p style={{ fontWeight: 600, color: "#ff4d4f", marginBottom: 8 }}>
        Something went wrong
      </p>
      <p
        style={{
          fontSize: 13,
          color: "#595959",
          marginBottom: 16,
          wordBreak: "break-word",
        }}
      >
        {error.message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: "6px 16px",
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
