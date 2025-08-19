import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import valetGentleman from '@assets/file_00000000eac861fba9e1e2ce393ba5b6 (2)_1755572080854.png';

const facts = [
  {
    title: "Understanding Your Market",
    fact: "We're analyzing real-time pricing data from multiple trusted sources to provide you with the most accurate market insights. This comprehensive search typically takes 15-30 seconds to ensure accuracy."
  },
  {
    title: "Did you know?",
    fact: "The average American family spends 73 hours researching senior living options. MySeniorValet reduces this to minutes with our comprehensive database of 33,510+ verified communities."
  },
  {
    title: "Senior Living Insight",
    fact: "Memory care costs typically run 20-30% higher than assisted living due to specialized staffing, secure environments, and personalized programming for residents with dementia."
  },
  {
    title: "Market Transparency",
    fact: "Less than 15% of senior living communities publicly display their pricing online. MySeniorValet changes this by aggregating available data and providing real market estimates."
  },
  {
    title: "Care Level Education",
    fact: "Independent Living communities offer maintenance-free living with amenities, while Assisted Living provides help with daily activities like medication management and bathing."
  },
  {
    title: "Financial Planning Tip",
    fact: "Long-term care insurance can cover 50-70% of assisted living costs, but policies must typically be purchased before age 65 and while in good health."
  },
  {
    title: "Geographic Pricing",
    fact: "Senior living costs vary by up to 300% across different states. Alaska and Connecticut are the most expensive, while Missouri and Alabama offer more affordable options."
  },
  {
    title: "Community Sizes",
    fact: "Senior living communities range from intimate 6-bed residential care homes to large continuing care retirement communities (CCRCs) with over 500 residents."
  },
  {
    title: "Medicare Coverage",
    fact: "Medicare generally doesn't cover long-term assisted living costs, but it may cover short-term skilled nursing care after a hospital stay of 3+ days."
  },
  {
    title: "Veterans Benefits",
    fact: "Veterans and surviving spouses may qualify for Aid & Attendance benefits, providing up to $2,230/month to help cover senior care costs."
  }
];

export function CompetitiveAnalysisLoader({ location }: { location: string }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 7000); // Changed from 3 seconds to 7 seconds for better readability

    return () => clearInterval(interval);
  }, []);

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