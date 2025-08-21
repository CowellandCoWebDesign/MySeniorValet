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
      description: "The average HUD-subsidized senior apartment costs just $336/month nationwide. Over 400,000 seniors qualify but don't know these programs exist.",
      source: "Source: U.S. Department of Housing and Urban Development, Section 202 Program Report 2024",
      link: "https://www.hud.gov/program_offices/housing/mfh/progdesc/eld202"
    },
    {
      title: "Hidden Senior Benefit",
      subtitle: "Medicare Coverage Insight",
      description: "Medicare covers up to 100 days of skilled nursing care after a hospital stay - but 67% of families pay out-of-pocket unnecessarily because they weren't informed.",
      source: "Source: Centers for Medicare & Medicaid Services, Medicare.gov Benefit Guide",
      link: "https://www.medicare.gov/coverage/skilled-nursing-facility-snf-care"
    },
    {
      title: "Little-Known Resource",
      subtitle: "State Assistance Programs",
      description: "42 states offer home modification grants up to $15,000 for seniors to age in place safely. Less than 3% of eligible seniors have applied.",
      source: "Source: Administration for Community Living, State Assistance Programs Database",
      link: "https://acl.gov/programs/support-people-disabilities/centers-independent-living"
    },
    {
      title: "Government Database Insight",
      subtitle: "Waitlist Reality Check",
      description: "HUD data shows the average wait for subsidized senior housing is 9-12 months. Starting your search early can save thousands in unnecessary private-pay costs.",
      source: "Source: HUD Office of Policy Development and Research, Waiting List Study 2024",
      link: "https://www.huduser.gov/portal/datasets/assthsg.html"
    },
    {
      title: "Critical Coverage Gap",
      subtitle: "Long-Term Care Statistics",
      description: "70% of seniors will need long-term care, but Medicare doesn't cover it. The average cost is $4,500/month - planning ahead with Medicaid can protect your assets.",
      source: "Source: U.S. Department of Health & Human Services, LongTermCare.gov",
      link: "https://acl.gov/ltc/basic-needs/how-much-care-will-you-need"
    },
    {
      title: "Veterans' Hidden Benefit",
      subtitle: "Aid & Attendance Program",
      description: "Veterans and surviving spouses can receive up to $2,295/month for assisted living through the VA's Aid & Attendance benefit - yet 2/3 of eligible veterans never apply.",
      source: "Source: U.S. Department of Veterans Affairs, Pension Benefits",
      link: "https://www.va.gov/pension/aid-attendance-housebound/"
    },
    {
      title: "Surprising Database Finding",
      subtitle: "Rural vs Urban Pricing",
      description: "Government data reveals rural senior living costs 40% less than urban facilities while often providing higher staff-to-resident ratios and satisfaction scores.",
      source: "Source: CMS Nursing Home Compare Database & USDA Rural Development Reports",
      link: "https://www.medicare.gov/care-compare/"
    }
  ];

  // Rotate messages every 20 seconds - more time to read
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setProgress(0); // Reset progress for new message
    }, 20000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  // Animate progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 400); // Update every 400ms to reach 100% in 20 seconds
    
    return () => clearInterval(progressInterval);
  }, [currentMessageIndex]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative bg-gray-900/90 backdrop-blur-md border-t border-gray-700",
        className
      )}
      style={{ maxHeight: '25vh' }} // Limit to 25% of viewport height
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Left: Gentleman Valet Mascot - Much smaller */}
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
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
              />
              {/* Small sparkles around mascot */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            </motion.div>
          </div>

          {/* Center: Compact Message Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  {/* Title and Subtitle on same line */}
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {currentMessage.title} • <span className="text-blue-400 font-medium">{currentMessage.subtitle}</span>
                    </h3>
                  </div>
                  
                  {/* Progress Bar - Inline and smaller */}
                  <div className="w-24 sm:w-32">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Compact Description */}
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                  {currentMessage.description}
                </p>
                
                {/* Compact Source */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                  <span className="text-gray-500">{currentMessage.source.split(',')[0]}</span>
                  <a 
                    href={currentMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Learn More</span>
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}