import { Component } from 'react';

class ErrorBoundary extends Component {
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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'left',
          background: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '800px',
            width: '100%',
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>⚠️ React Error Caught</h2>

            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Error Message:</h3>
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#721c24',
                fontSize: '14px'
              }}>
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </div>

            {this.state.error?.stack && (
              <div style={{
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#721c24' }}>Stack Trace:</h3>
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '12px',
                  color: '#721c24'
                }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => {
                  console.log('Error details:', this.state.error);
                  navigator.clipboard.writeText(
                    `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.error?.stack}`
                  );
                  alert('Error copied to clipboard!');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                📋 Copy Error
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;