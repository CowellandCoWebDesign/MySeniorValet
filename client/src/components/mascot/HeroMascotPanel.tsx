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

  // Rotate messages every 10 seconds - comfortable reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setProgress(0); // Reset progress for new message
    }, 10000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  // Animate progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 200); // Update every 200ms to reach 100% in 10 seconds
    
    return () => clearInterval(progressInterval);
  }, [currentMessageIndex]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "hero-mascot-panel",
        className
      )}
    >
      <div className="mascot-panel-inner">
        <div className="mascot-panel-content">
          {/* Left: Gentleman Valet Mascot */}
          <div className="mascot-icon">
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
                className="mascot-image"
              />
              {/* Small sparkles around mascot */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1 right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>
            </motion.div>
          </div>

          {/* Center: Message Content with fluid typography */}
          <div className="mascot-text-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mascot-title-row">
                  {/* Title and Subtitle */}
                  <h3 className="mascot-title">
                    {currentMessage.title} • {currentMessage.subtitle}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mascot-progress-bar">
                    <motion.div 
                      className="mascot-progress-fill"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="mascot-description">
                  {currentMessage.description}
                </p>
                
                {/* Source */}
                <div className="mascot-source">
                  <span className="source-label">Source:</span>
                  <a 
                    href={currentMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-value hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{currentMessage.source.split(',')[0]}</span>
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