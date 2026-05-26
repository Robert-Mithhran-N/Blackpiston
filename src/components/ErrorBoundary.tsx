import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary Caught:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    
    // Check for chunk loading errors (typical when new app version deletes old pre-cached assets)
    const isChunkError = 
      error.name === 'ChunkLoadError' || 
      /chunk|loading|dynamically|import/i.test(error.message);
      
    if (isChunkError) {
      console.warn('Chunk loading error detected! Attempting automatic recovery...');
      const lastReload = sessionStorage.getItem('last-chunk-error-reload');
      const now = Date.now();
      
      // Throttle reloads to prevent infinite reload loops (e.g. 10s window)
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('last-chunk-error-reload', now.toString());
        
        // Clear Cache Storage to force clean reload
        if ('caches' in window) {
          caches.keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .catch((err) => console.error("Error clearing caches on chunk failure:", err))
            .finally(() => {
              window.location.reload();
            });
        } else {
          window.location.reload();
        }
        return;
      }
    }

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '800px',
          margin: '40px auto',
          backgroundColor: '#fee',
          border: '2px solid #c00',
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#c00', marginBottom: '20px' }}>
            ⚠️ Application Error
          </h1>
          <h2 style={{ marginBottom: '10px' }}>Error Message:</h2>
          <pre style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            marginBottom: '20px'
          }}>
            {this.state.error?.message}
          </pre>
          
          <h2 style={{ marginBottom: '10px' }}>Stack Trace:</h2>
          <pre style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            maxHeight: '300px'
          }}>
            {this.state.error?.stack}
          </pre>

          {this.state.errorInfo && (
            <>
              <h2 style={{ marginBottom: '10px', marginTop: '20px' }}>Component Stack:</h2>
              <pre style={{
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                maxHeight: '200px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#c00',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
