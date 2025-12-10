import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Reset error state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleReset = () => {
    // Just reset the error state without reloading
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary-container" style={{
          padding: "40px 20px",
          textAlign: "center",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div className="error-boundary-content" style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            <div className="error-icon" style={{
              fontSize: "64px",
              color: "#dc3545",
              marginBottom: "20px",
            }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h2 style={{
              color: "#333",
              marginBottom: "16px",
              fontSize: "24px",
            }}>
              Oops! Something went wrong
            </h2>
            
            <p style={{
              color: "#666",
              marginBottom: "24px",
              fontSize: "16px",
            }}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                textAlign: "left",
                border: "1px solid #dee2e6",
              }}>
                <summary style={{
                  cursor: "pointer",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "#495057",
                }}>
                  Error Details (Development Mode)
                </summary>
                <div style={{
                  fontSize: "14px",
                  fontFamily: "monospace",
                  color: "#dc3545",
                  marginBottom: "12px",
                  wordBreak: "break-word",
                }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#6c757d",
                    maxHeight: "200px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    <strong>Stack Trace:</strong>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </details>
            )}

            <div className="error-actions" style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}>
              <button
                onClick={this.handleReset}
                className="btn btn-outline-primary"
                style={{
                  padding: "10px 24px",
                  fontSize: "16px",
                }}
              >
                <i className="fas fa-redo me-2"></i>
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  padding: "10px 24px",
                  fontSize: "16px",
                }}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Reload Page
              </button>

              <button
                onClick={() => window.history.back()}
                className="btn btn-outline-secondary"
                style={{
                  padding: "10px 24px",
                  fontSize: "16px",
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Go Back
              </button>
            </div>

            <p style={{
              marginTop: "24px",
              fontSize: "14px",
              color: "#6c757d",
            }}>
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
