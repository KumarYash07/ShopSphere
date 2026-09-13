import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            padding: '24px',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#1e293b',
              borderRadius: 16,
              padding: '32px',
              border: '1px solid #334155',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <FiAlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#f8fafc' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
              An unexpected error occurred while loading this page.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: 8,
                  padding: '12px',
                  marginBottom: 24,
                  fontSize: 12,
                  color: '#f87171',
                  textAlign: 'left',
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <FiRefreshCw size={15} /> Reload Page
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  background: '#334155',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <FiHome size={15} /> Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
