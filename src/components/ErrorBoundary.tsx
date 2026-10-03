import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Changing this clears the error, e.g. the current path, so navigating away recovers. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/** Shows a recoverable error card (with the real message) instead of letting React unmount the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[arriving tomorrow] render error:", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <main className="page center error-card" role="alert">
        <h1>
          This page got lost <span className="serif">in transit.</span>
        </h1>
        <p className="lede">Something broke while loading it. Unlike your clothes, a reload usually shows up.</p>
        <code className="error-message">{error.name}: {error.message}</code>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </main>
    );
  }
}
