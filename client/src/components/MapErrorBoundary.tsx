import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error('Map error caught by boundary:', error, errorInfo);
    
    // Check if it's the specific Leaflet error
    if (error.message && error.message.includes('_leaflet_pos')) {
      console.log('Caught Leaflet position error, attempting recovery...');
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Force a page reload to reset the map
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Map Error</h2>
          <p className="text-gray-600 text-center mb-4">
            The map encountered an error while loading. This can happen when panning or zooming quickly.
          </p>
          <Button onClick={this.handleReset} className="bg-blue-600 hover:bg-blue-700">
            Reload Map
          </Button>
          {this.state.error && (
            <details className="mt-4 text-xs text-gray-500">
              <summary>Error details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded">{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;