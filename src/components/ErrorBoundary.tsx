import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="flex items-center justify-center h-full select-none"
          style={{ color: "var(--text-tertiary)" }}
        >
          <div className="text-center space-y-3 max-w-md px-4">
            <div className="text-[15px] font-medium" style={{ color: "var(--text-secondary)" }}>
              Something went wrong
            </div>
            <div
              className="text-[12px] leading-relaxed break-all"
              style={{ color: "var(--text-tertiary)" }}
            >
              {this.state.error?.message || "Unknown error"}
            </div>
            <button
              onClick={this.handleRetry}
              className="px-3 py-1.5 text-[12px] rounded-md font-medium transition-colors"
              style={{
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}