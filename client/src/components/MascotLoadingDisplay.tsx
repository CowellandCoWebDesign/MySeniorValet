import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import valetGentleman from '@assets/gentleman-mascot.png';
import nostalgicSpaceImage from '@assets/generated_images/Memorial_plaques_in_space_73458db7.png';
import { getShuffledFacts } from '@/lib/loadingFacts';

interface MascotLoadingDisplayProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progressDuration?: number;
  factRotationSpeed?: number;
  compact?: boolean;
}

export function MascotLoadingDisplay({ 
  title = "Searching Communities",
  subtitle = "Analyzing over 33,560 verified senior living options",
  showProgress = true,
  progressDuration = 30,
  factRotationSpeed = 7000,
  compact = false
}: MascotLoadingDisplayProps) {
  const [facts] = useState(() => getShuffledFacts());
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, factRotationSpeed);

    return () => clearInterval(interval);
  }, [facts.length, factRotationSpeed]);

  const currentFact = facts[currentFactIndex];

  if (compact) {
    // Compact version for inline loading states
    return (
      <div className="flex flex-col items-center justify-center p-6">
        {/* Mascot Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <img 
            src={valetGentleman} 
            alt="Your Senior Valet Assistant" 
            className="w-24 h-24 object-contain"
          />
        </motion.div>

        {/* Title */}
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2"
        >
          {title}
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center"
        >
          {subtitle}
        </motion.p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: progressDuration, ease: "linear" }}
            />
          </div>
        )}

        {/* Rotating Fact - Compact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-center"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">{currentFact.title}:</span> {currentFact.fact}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Full version for dedicated loading screens with nostalgic space background
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${nostalgicSpaceImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0a0015'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
      
      {/* Animated cloud layers for "peeking through clouds" effect */}
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
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl w-full relative z-10 p-8 pt-32">
        {/* Title Section - positioned lower to not block memorial plaques */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center mb-3 text-white"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-200 mb-6 text-base max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: progressDuration, ease: "linear" }}
            />
          </div>
        )}

        {/* Main Content Section */}
        <div className="flex flex-col items-center">
          {/* Rotating Facts with Nostalgic Theme and Valet */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFactIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-orange-600/90 to-orange-700/90 p-1 rounded-lg shadow-2xl mb-8"
            >
              <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg p-6 flex items-center gap-6">
                {/* Valet on the left */}
                <img 
                  src={valetGentleman} 
                  alt="Your Senior Valet Assistant" 
                  className="w-24 h-24 object-contain flex-shrink-0"
                />
                
                {/* Info on the right */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3 text-orange-400">
                    {currentFact.title}
                  </h3>
                  <p className="text-gray-200 leading-relaxed">
                    {currentFact.fact}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Loading Indicators */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mb-2"
              />
              <span className="text-sm text-gray-300">Gathering Data</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 bg-purple-500 rounded-full mb-2 flex items-center justify-center"
              >
                <span className="text-white text-xs">AI</span>
              </motion.div>
              <span className="text-sm text-gray-300">Processing</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 bg-green-500 rounded-full mb-2"
              />
              <span className="text-sm text-gray-300">Verifying</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-orange-200 mt-8"
        >
          Analyzing over 33,560 verified senior living communities nationwide
        </motion.p>

        {/* Floating Stars */}
        <div className="absolute right-10 bottom-20">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
            className="text-3xl opacity-60"
          >
            🌟
          </motion.div>
        </div>

        <div className="absolute left-10 top-20">
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl"
          >
            ✨
          </motion.div>
        </div>
      </div>
    </div>
  );
}