import React from 'react';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'var(--color-background)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                    }}>
                        <AlertTriangle size={40} color="#EF4444" />
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-heading)' }}>
                        Something went wrong
                    </h1>

                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', maxWidth: '300px' }}>
                        We're sorry, but something unexpected happened. Please try again or report this issue.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '14px 24px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>

                        <a
                            href="/help"
                            style={{
                                padding: '14px 24px',
                                background: 'transparent',
                                color: 'var(--color-primary)',
                                border: '1px solid var(--color-primary)',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                textDecoration: 'none',
                            }}
                        >
                            <MessageCircle size={18} />
                            Report the Bug
                        </a>
                    </div>

                    {import.meta.env.MODE === 'development' && this.state.error && (
                        <details style={{ marginTop: '32px', textAlign: 'left', width: '100%', maxWidth: '400px' }}>
                            <summary style={{ cursor: 'pointer', color: '#999', fontSize: '12px' }}>
                                Error Details
                            </summary>
                            <pre style={{
                                marginTop: '8px',
                                padding: '12px',
                                background: '#f5f5f5',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '11px',
                                overflow: 'auto',
                                color: '#666',
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
