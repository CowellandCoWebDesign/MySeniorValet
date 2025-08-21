import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroMascotPanelProps {
  className?: string;
}

export function HeroMascotPanel({ className }: HeroMascotPanelProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Rotating helpful facts from government databases
  const messages = [
    {
      title: "Did You Know?",
      subtitle: "HUD Section 202 Fact",
      description: "The average HUD-subsidized senior apartment costs just $336/month nationwide. Over 400,000 seniors qualify but don't know these programs exist."
    },
    {
      title: "Hidden Senior Benefit",
      subtitle: "Medicare Coverage Insight",
      description: "Medicare covers up to 100 days of skilled nursing care after a hospital stay - but 67% of families pay out-of-pocket unnecessarily because they weren't informed."
    },
    {
      title: "Little-Known Resource",
      subtitle: "State Assistance Programs",
      description: "42 states offer home modification grants up to $15,000 for seniors to age in place safely. Less than 3% of eligible seniors have applied."
    },
    {
      title: "Government Database Insight",
      subtitle: "Waitlist Reality Check",
      description: "HUD data shows the average wait for subsidized senior housing is 9-12 months. Starting your search early can save thousands in unnecessary private-pay costs."
    },
    {
      title: "Critical Coverage Gap",
      subtitle: "Long-Term Care Statistics",
      description: "70% of seniors will need long-term care, but Medicare doesn't cover it. The average cost is $4,500/month - planning ahead with Medicaid can protect your assets."
    },
    {
      title: "Veterans' Hidden Benefit",
      subtitle: "Aid & Attendance Program",
      description: "Veterans and surviving spouses can receive up to $2,295/month for assisted living through the VA's Aid & Attendance benefit - yet 2/3 of eligible veterans never apply."
    },
    {
      title: "Surprising Database Finding",
      subtitle: "Rural vs Urban Pricing",
      description: "Government data reveals rural senior living costs 40% less than urban facilities while often providing higher staff-to-resident ratios and satisfaction scores."
    }
  ];

  // Rotate messages every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setProgress(0); // Reset progress for new message
    }, 6000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  // Animate progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 120); // Update every 120ms to reach 100% in 6 seconds
    
    return () => clearInterval(progressInterval);
  }, [currentMessageIndex]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative bg-gray-900/95 backdrop-blur-xl border-t border-gray-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Gentleman Valet Mascot */}
          <div className="flex-shrink-0">
            <motion.div 
              className="relative"
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="/assets/gentleman-mascot.png" 
                alt="Your Personal Senior Living Valet"
                className="h-32 sm:h-40 lg:h-48 w-auto object-contain"
              />
              {/* Animated sparkles around mascot */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </div>
            </motion.div>
          </div>

          {/* Center/Right: Message Content */}
          <div className="flex-1 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Main Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {currentMessage.title}
                </h2>
                
                {/* Subtitle */}
                <h3 className="text-lg sm:text-xl text-blue-400 font-semibold mb-4">
                  {currentMessage.subtitle}
                </h3>

                {/* Progress Bar */}
                <div className="w-full max-w-2xl mx-auto lg:mx-0 mb-4">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto lg:mx-0 border border-gray-700">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {currentMessage.description}
                  </p>
                </div>

                {/* Message Indicators */}
                <div className="flex justify-center lg:justify-start gap-2 mt-6">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentMessageIndex(index);
                        setProgress(0);
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentMessageIndex 
                          ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500" 
                          : "bg-gray-600 hover:bg-gray-500"
                      )}
                      aria-label={`Go to message ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}