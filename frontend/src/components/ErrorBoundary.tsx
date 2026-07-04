import { Component, type ErrorInfo, type ReactNode } from "react";
import { withTranslation, type WithTranslation } from "react-i18next";

interface ErrorBoundaryOwnProps {
    children: ReactNode;
    fallback?: ReactNode;
}

type ErrorBoundaryProps = ErrorBoundaryOwnProps & WithTranslation;

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
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render(): ReactNode {
        const { t, fallback, children } = this.props;
        if (this.state.hasError) {
            if (fallback) return fallback;
            return (
                <div role="alert" style={{ padding: 24, textAlign: "center" }}>
                    <h2>{t("errorBoundary.title")}</h2>
                    <p>{this.state.error?.message || t("errorBoundary.unexpectedError")}</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        style={{ marginTop: 12, padding: "8px 16px", cursor: "pointer" }}
                    >
                        {t("errorBoundary.reload")}
                    </button>
                </div>
            );
        }
        return children;
    }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
export default ErrorBoundary;
