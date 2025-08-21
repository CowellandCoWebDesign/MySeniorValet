import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import valetGentleman from '@assets/gentleman-mascot.png';
import { getShuffledFacts } from '@/lib/loadingFacts';

export function CompetitiveAnalysisLoader({ location }: { location: string }) {
  const [facts] = useState(() => getShuffledFacts());
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 7000); // Changed from 3 seconds to 7 seconds for better readability

    return () => clearInterval(interval);
  }, [facts.length]);

  const currentFact = facts[currentFactIndex];

  return (
    <div className="min-h-[600px] flex items-center justify-center p-8">
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
          className="text-2xl font-bold text-center mb-4 text-gray-800"
        >
          Analyzing {location} Senior Living Market
        </motion.h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 30, ease: "linear" }}
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
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-3 text-purple-700">
              {currentFact.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">
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
            <span className="text-sm text-gray-600">Gathering Data</span>
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
            <span className="text-sm text-gray-600">Analyzing Market</span>
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
            <span className="text-sm text-gray-600">Verifying Sources</span>
          </motion.div>
        </div>

        {/* Friendly Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Your personal valet is working hard to gather the most accurate and up-to-date information.
          <br />
          This usually takes 15-30 seconds for a comprehensive analysis.
        </motion.p>
      </div>
    </div>
  );
}