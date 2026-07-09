import { Component } from 'react';
import './ErrorBoundary.css';
import Button from '../Button/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hook point for future logging service integration.
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2 className="error-boundary__title">Something went wrong</h2>
          <p className="error-boundary__description">
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          <Button variant="primary" onClick={this.handleReload}>
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;