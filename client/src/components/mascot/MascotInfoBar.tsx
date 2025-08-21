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
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Left: Gentleman Valet Mascot with subtle animation */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Our Gentleman Valet Mascot */}
              <div className="text-3xl sm:text-4xl animate-bounce">
                🤵
              </div>
              {/* Small pulse effect around mascot */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" />
            </div>
            
            {/* "Did you know?" label */}
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <span className="animate-pulse">💡</span>
              <span>Did you know?</span>
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
                className="flex items-center justify-center gap-2"
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", currentMessage.color)} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
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