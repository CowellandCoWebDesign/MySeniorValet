import { motion } from 'framer-motion';
import { Loader2, Stars, Sparkles } from 'lucide-react';
import nostalgicSpaceImage from '@assets/generated_images/nostalgic_space_scene_corrected.svg';

interface NostalgicLoadingScreenProps {
  message?: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
}

export function NostalgicLoadingScreen({ 
  message = "Loading your experience...", 
  subtitle = "Preparing something special",
  showProgress = false,
  progress = 0
}: NostalgicLoadingScreenProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url(${nostalgicSpaceImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
      
      {/* Animated cloud layers for depth */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-indigo-900/25"></div>
      </motion.div>
      
      {/* Animated Stars Overlay */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
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

      {/* Main Loading Content */}
      <div className="relative z-10 text-center px-6 max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-orange-600/90 to-orange-700/90 p-1 rounded-xl backdrop-blur-lg"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg p-8 text-white">
            {/* Spinning loader with nostalgic glow */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Loader2 className="w-12 h-12 text-orange-400" />
                <motion.div
                  className="absolute inset-0 w-12 h-12 border-2 border-orange-500/30 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Loading message */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-white">
                {message}
              </h2>
              <p className="text-gray-300">
                {subtitle}
              </p>
            </motion.div>

            {/* Progress bar if needed */}
            {showProgress && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  {Math.round(progress)}% complete
                </p>
              </motion.div>
            )}

            {/* Floating animation elements */}
            <div className="flex justify-center items-center mt-4 space-x-4">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: 0
                }}
              >
                <Stars className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: 1
                }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [0, 8, -8, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: 2
                }}
              >
                <Stars className="w-5 h-5 text-blue-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional floating nostalgic elements */}
      <motion.div
        className="absolute right-1/4 bottom-32"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="text-4xl opacity-60">🌟</div>
      </motion.div>

      <motion.div
        className="absolute left-1/4 top-1/4"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="text-3xl">✨</div>
      </motion.div>
    </div>
  );
}

export default NostalgicLoadingScreen;