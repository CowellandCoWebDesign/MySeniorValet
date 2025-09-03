import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import thinkerLighthouseImage from '@assets/generated_images/Thinker_cliff_sunset_lighthouse_e6af9604.png';
import { getShuffledFacts } from '@/lib/loadingFacts';

interface SearchLoaderProps {
  searchQuery?: string;
  searchType?: string;
}

export function SearchLoader({ searchQuery, searchType }: SearchLoaderProps) {
  const [facts] = useState(() => getShuffledFacts());
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentFactIndex];

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        {/* Thinker Looking at Lighthouse Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 mx-auto w-full max-w-2xl aspect-[16/10] overflow-hidden rounded-2xl shadow-2xl"
        >
          <img 
            src={thinkerLighthouseImage} 
            alt="The Thinker contemplating the lighthouse across the water" 
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Loading Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400"
        >
          {searchQuery ? (
            <>Discovering {searchType || 'Communities'} in {searchQuery}</>
          ) : (
            <>Searching Across Our Global Network</>
          )}
        </motion.h2>

        {/* Elegant Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 20, ease: "linear" }}
          />
        </div>

        {/* Rotating Facts */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-purple-100 dark:border-purple-900"
          >
            <h3 className="text-lg font-semibold mb-3 text-purple-700 dark:text-purple-300">
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
              className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mb-2"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Searching Database</span>
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
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-2 flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold">AI</span>
            </motion.div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Discovering Options</span>
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Verifying Data</span>
          </motion.div>
        </div>

        {/* Inspiring Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Like the lighthouse guides ships to safe harbor, we're guiding you to the perfect match.
          <br />
          <span className="text-xs">This usually takes 10-20 seconds for comprehensive results.</span>
        </motion.p>
      </div>
    </div>
  );
}