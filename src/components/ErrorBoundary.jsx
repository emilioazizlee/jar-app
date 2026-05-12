import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[JAR Error]', error, errorInfo);
    } else {
      // Production: log sanitized error only — no user data
      console.error('[JAR Error]', {
        message: error.message,
        stack: error.stack?.split('\n')[0],
        component: errorInfo.componentStack?.split('\n')[1]?.trim(),
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 40,
          textAlign: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          background: '#0a0a0a',
          color: '#7a7a7a',
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🫙</div>
          <p style={{ fontSize: 18, marginBottom: 10, color: '#fff' }}>
            Something went wrong
          </p>
          <p style={{ fontSize: 12, marginBottom: 30, maxWidth: 400, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#7a7a7a',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#abff4f',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 8,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;