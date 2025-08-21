import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, Shield, Heart, Star, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MascotInfoBarProps {
  className?: string;
}

export function MascotInfoBar({ className }: MascotInfoBarProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Informative messages that scroll through
  const messages = [
    { icon: TrendingUp, text: "34,181+ verified communities nationwide", color: "text-green-500" },
    { icon: Shield, text: "Real HUD pricing from government sources", color: "text-blue-500" },
    { icon: Heart, text: "Helping families find the perfect care since 2025", color: "text-pink-500" },
    { icon: Star, text: "Triple AI-verified for absolute accuracy", color: "text-yellow-500" },
    { icon: CheckCircle, text: "Live availability updated every 24 hours", color: "text-purple-500" },
    { icon: Info, text: "Free, transparent, no hidden fees ever", color: "text-indigo-500" },
  ];

  // Rotate through messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <div className={cn(
      "relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-lg",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6 sm:py-8 lg:py-10">
          {/* Left: Gentleman Valet Mascot - Standing Still */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Our Official Gentleman Valet Mascot */}
              <img 
                src="/assets/gentleman-mascot.png" 
                alt="Your Personal Senior Living Valet"
                className="h-16 sm:h-20 lg:h-24 w-auto object-contain"
              />
            </div>
            
            {/* "Did you know?" label */}
            <div className="hidden sm:flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                <span className="text-lg animate-pulse">💡</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Did you know?</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Your Valet has important info</span>
            </div>
          </div>

          {/* Center: Scrolling message */}
          <div className="flex-1 mx-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-3"
              >
                <Icon className={cn("w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0", currentMessage.color)} />
                <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
                  {currentMessage.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Progress dots */}
          <div className="flex items-center gap-1">
            {messages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  index === currentMessageIndex
                    ? "bg-blue-500 w-3"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}