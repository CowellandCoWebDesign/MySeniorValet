import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import valetGentleman from '@/assets/valet-mascot.png';
import thinkerSpaceImage from '@assets/generated_images/Thinker_statue_in_cosmic_space_86227ae1.png';
import { getShuffledFacts } from '@/lib/loadingFacts';

// Preload The Thinker image immediately when component loads
const preloadThinkerImage = () => {
  if (typeof document !== 'undefined') {
    const img = new Image();
    img.src = thinkerSpaceImage;
  }
};

// Call preload immediately
preloadThinkerImage();

interface MascotLoadingDisplayProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progressDuration?: number;
  factRotationSpeed?: number;
  compact?: boolean;
  processStages?: string[];
}

export function MascotLoadingDisplay({ 
  title = "Searching Communities",
  subtitle = "Analyzing over 33,560 verified senior living options",
  showProgress = true,
  progressDuration = 15, // Reduced from 30 to 15 seconds
  factRotationSpeed = 7000,
  compact = false,
  processStages = ["Searching web for photos", "Analyzing image quality", "Verifying sources"]
}: MascotLoadingDisplayProps) {
  const [facts] = useState(() => getShuffledFacts());
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload image and track loading state
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = thinkerSpaceImage;

    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, factRotationSpeed);

    // Cycle through process stages more frequently for status updates
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % processStages.length);
    }, 2000);

    return () => {
      clearInterval(factInterval);
      clearInterval(stageInterval);
    };
  }, [facts.length, factRotationSpeed, processStages.length]);

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

  // Show simple loading state while image loads
  if (!imageLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center relative min-h-[400px] bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white">{title}</p>
        </div>
      </div>
    );
  }

  // Full version - smaller and more focused on process status
  return (
    <div 
      className="w-full h-full flex items-center justify-center relative min-h-[400px]"
      style={{
        backgroundImage: `url(${thinkerSpaceImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0a0015'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
      
      {/* Animated Stars Overlay */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
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

      <div className="max-w-2xl w-full relative z-10 p-8 text-center">
        {/* Title */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-4"
        >
          {title}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-200 mb-8"
        >
          {subtitle}
        </motion.p>

        {/* Progress Bar with estimated time */}
        {showProgress && (
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: progressDuration, ease: "linear" }}
              />
            </div>
            <p className="text-sm text-gray-400">
              Estimated completion: {progressDuration} seconds
            </p>
          </div>
        )}

        {/* Current Process Stage - Only show if image is loaded */}
        {imageLoaded && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-black/50 backdrop-blur-sm rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                />
                <p className="text-blue-400 font-medium">
                  {processStages[currentStageIndex]}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Compact Loading Indicators */}
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
              className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-1"
            />
            <span className="text-xs text-gray-300">Searching</span>
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
              className="w-6 h-6 bg-purple-500 rounded-full mb-1 flex items-center justify-center"
            >
              <span className="text-white text-xs">AI</span>
            </motion.div>
            <span className="text-xs text-gray-300">Analyzing</span>
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
              className="w-6 h-6 bg-green-500 rounded-full mb-1"
            />
            <span className="text-xs text-gray-300">Verifying</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}