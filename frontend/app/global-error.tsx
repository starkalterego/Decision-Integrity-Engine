'use client';

/**
 * Global error boundary for the Next.js App Router.
 * Catches unhandled errors in the root layout and provides
 * a recovery path without a full page reload.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '40px',
                            maxWidth: '480px',
                            width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                            Something went wrong
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
                            An unexpected error occurred. Our team has been notified.
                            {process.env.NODE_ENV === 'development' && error.message && (
                                <>
                                    <br />
                                    <code
                                        style={{
                                            display: 'block',
                                            marginTop: '12px',
                                            padding: '8px',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            color: '#dc2626',
                                            textAlign: 'left',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {error.message}
                                        {error.digest && ` (Digest: ${error.digest})`}
                                    </code>
                                </>
                            )}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={reset}
                                style={{
                                    padding: '8px 20px',
                                    background: '#1d4ed8',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Try again
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                                style={{
                                    padding: '8px 20px',
                                    background: '#fff',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Go home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
