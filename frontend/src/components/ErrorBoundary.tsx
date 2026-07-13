import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "../i18n";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // eslint-disable-next-line no-console
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render(): ReactNode {
        const { fallback, children } = this.props;
        if (this.state.hasError) {
            if (fallback) return fallback;
            return (
                <div role="alert" style={{ padding: "var(--space-6)", textAlign: "center" }}>
                    <h2>{i18n.t("errorBoundary.title")}</h2>
                    <p>{this.state.error?.message || i18n.t("errorBoundary.unexpectedError")}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{ marginTop: "var(--space-3)", padding: "var(--space-2) var(--space-4)", cursor: "pointer" }}
                    >
                        {i18n.t("errorBoundary.reload")}
                    </button>
                </div>
            );
        }
        return children;
    }
}

export const ErrorBoundary = ErrorBoundaryComponent;
export default ErrorBoundary;
