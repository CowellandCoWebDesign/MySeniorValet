import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, RefreshCw, AlertTriangle, Rocket } from 'lucide-react';
import nostalgicSpaceImage from '@assets/generated_images/Nostalgic_space_scene_logos_3b09df12.png';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class NostalgicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      
      return (
        <div 
          className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-black"
          style={{
            backgroundImage: `url(${nostalgicSpaceImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay with cloud effect for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          
          {/* Animated cloud layers peeking effect */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-indigo-900/30"></div>
          </motion.div>
          
          {/* Animated Stars Overlay */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>



          {/* Main Error Content */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-1 rounded-xl">
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                    <h1 className="text-3xl font-bold">We'll Be Right Back!</h1>
                  </div>

                  <div className="space-y-6">
                    {/* Purple circle with heart */}
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center relative"
                      >
                        <div className="text-5xl">❤️</div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                      </motion.div>
                    </div>

                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-semibold flex items-center justify-center gap-2">
                        Sorry! High Traffic Alert 
                        <span className="text-3xl">🚀</span>
                      </h2>
                      
                      <p className="text-gray-300 text-lg">
                        We are experiencing a lot of traffic right now and will be back soon!
                      </p>

                      <div className="bg-slate-800/50 rounded-lg p-6 text-left space-y-3">
                        <p className="text-center mb-4">
                          Thank you so much for your support of our mission to bring:
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Transparency and access for all</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Real-time pricing information</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Live availability updates</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>Authentic ratings & reviews</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>All in one trusted place!</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-center pt-4">
                        <Button 
                          onClick={() => window.location.reload()}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 text-lg"
                        >
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Try Again
                        </Button>
                        <Button 
                          onClick={() => window.location.href = '/'}
                          variant="outline"
                          className="border-white text-white hover:bg-white/10 px-6 py-3 text-lg"
                        >
                          <Home className="w-5 h-5 mr-2" />
                          Go Home
                        </Button>
                      </div>

                      <p className="text-gray-400 text-sm mt-6">
                        If this problem persists, please contact us at{' '}
                        <a href="mailto:hello@myseniorvalet.com" className="text-orange-400 hover:underline">
                          hello@myseniorvalet.com
                        </a>
                      </p>

                      {/* Technical Details (Development Only) */}
                      {isDevelopment && this.state.error && (
                        <details className="mt-6 text-left">
                          <summary className="cursor-pointer text-gray-400 hover:text-white">
                            ▼ Technical Details (Development Only)
                          </summary>
                          <div className="mt-2 p-4 bg-black/50 rounded-lg">
                            <p className="text-red-400 font-mono text-sm break-all">
                              {this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                              <pre className="mt-2 text-gray-500 text-xs overflow-auto max-h-48">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Floating Elements */}
          <motion.div
            className="absolute right-1/4 bottom-48"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="text-6xl">🌟</div>
          </motion.div>

          <motion.div
            className="absolute left-1/4 top-1/3"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="text-4xl">✨</div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NostalgicErrorBoundary;