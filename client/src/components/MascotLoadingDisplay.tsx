import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import valetGentleman from '@assets/gentleman-mascot.png';
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

  // Full version for dedicated loading screens
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Valet Gentleman Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <img 
            src={valetGentleman} 
            alt="Your Senior Valet Assistant" 
            className="w-48 h-48 object-contain"
          />
        </motion.div>

        {/* Loading Title */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-gray-200"
        >
          {title}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-600 dark:text-gray-400 mb-6"
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

        {/* Rotating Facts */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-400">
              {currentFact.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentFact.fact}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Loading Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Gathering Data</span>
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Processing</span>
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Verifying</span>
          </motion.div>
        </div>

        {/* Friendly Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Your personal valet is working to find the best communities for you.
          <br />
          This typically takes a few seconds for comprehensive results.
        </motion.p>
      </div>
    </div>
  );
}