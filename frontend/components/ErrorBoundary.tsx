'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global error boundary to catch React rendering errors
 * Prevents white screen of death in production
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // TODO: Send to error tracking service (Sentry, etc.)
        // if (process.env.NODE_ENV === 'production') {
        //     Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
        // }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0a0f1a' }}>
                    <div className="max-w-md w-full bg-[#0f1419] border border-gray-800 rounded-lg p-8 text-center">
                        <div className="text-red-400 text-5xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-100 mb-3">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. Please refresh the page to continue.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left mb-6">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs text-red-400 bg-black/50 p-3 rounded overflow-auto max-h-48">
                                    {this.state.error.toString()}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
