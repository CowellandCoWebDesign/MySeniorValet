import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl border-2 border-orange-200 dark:border-orange-800">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <AlertTriangle className="w-8 h-8" />
                We'll Be Right Back!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center animate-pulse">
                      <Heart className="w-16 h-16 text-red-500" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Sorry! High Traffic Alert 🚀
                </h2>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
                  We are experiencing a lot of traffic right now and will be back soon!
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-base text-gray-800 dark:text-gray-200 font-medium mb-3">
                    Thank you so much for your support of our mission to bring:
                  </p>
                  <ul className="text-left max-w-md mx-auto space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">Transparency and access for all</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">Real-time pricing information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">Live availability updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">Authentic ratings & reviews</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">All in one trusted place!</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    onClick={this.handleReload}
                    size="lg"
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    size="lg"
                    variant="outline"
                    className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    Go Home
                  </Button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                  If this problem persists, please contact us at{' '}
                  <a href="mailto:hello@myseniorvalet.com" className="text-blue-600 hover:underline">
                    hello@myseniorvalet.com
                  </a>
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Technical Details (Development Only)
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {this.state.error.toString()}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}