'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

// Global error boundary for the entire app
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            // Here you would typically log to Sentry, LogRocket, or similar service
            console.log('Production error logging would go here');
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-lg w-full text-center">
                        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-4">Bir Hata Oluştu</h2>
                        <p className="text-gray-300 mb-6">
                            Üzgünüz, bir beklenmedik hata ile karşılaştık. Lütfen sayfayı yenilemeyi deneyin.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left mb-6 p-4 bg-red-900/30 rounded-lg">
                                <summary className="cursor-pointer text-red-300 font-semibold mb-2">
                                    Hata Detayları (Development)
                                </summary>
                                <pre className="text-xs text-red-200 overflow-auto">
                                    {this.state.error.message}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="btn-premium inline-flex items-center gap-2 px-6 py-3"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = () => setError(null);

    const handleError = React.useCallback((error: Error) => {
        console.error('Manual error:', error);
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { handleError, resetError };
};

export default ErrorBoundary;