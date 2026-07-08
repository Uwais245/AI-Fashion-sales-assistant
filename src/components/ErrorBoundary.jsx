import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in app:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background">
          <FiAlertTriangle className="text-5xl text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-gray-800">Something went wrong</h1>
          <p className="text-gray-500 mt-2 max-w-sm">
            This page hit an unexpected error. Try reloading — if it keeps happening, it's worth a bug report.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
