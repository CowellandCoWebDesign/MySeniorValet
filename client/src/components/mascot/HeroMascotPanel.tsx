import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroMascotPanelProps {
  className?: string;
}

export function HeroMascotPanel({ className }: HeroMascotPanelProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shuffledMessages, setShuffledMessages] = useState<any[]>([]);
  
  // Helpful senior living insights and platform features
  const platformDifferentiators = [
    {
      title: "Save $3,000+ Monthly",
      subtitle: "HUD Housing Available",
      description: "Did you know? HUD senior housing charges just 30% of your income for rent. With 5,936 HUD properties in our database, you could save thousands monthly while getting quality care.",
      source: "HUD.gov - Over 5,936 subsidized senior properties nationwide",
      link: "https://www.hud.gov/topics/information_for_senior_citizens",
      category: "cost_savings"
    },
    {
      title: "Free VA Benefits",
      subtitle: "Up to $2,500/Month",
      description: "Veterans and surviving spouses may qualify for Aid & Attendance benefits worth up to $2,500 monthly for senior care. We help you find VA-contracted communities.",
      source: "VA.gov - Aid and Attendance enhanced pension benefit",
      link: "https://www.va.gov/pension/aid-attendance-housebound/",
      category: "veteran_benefits"
    },
    {
      title: "Medicare Covers More",
      subtitle: "100 Days of Skilled Care",
      description: "Medicare Part A covers up to 100 days of skilled nursing care after a hospital stay. Many families don't know this benefit exists - we show which communities accept Medicare.",
      source: "Medicare.gov - Skilled nursing facility care coverage",
      link: "https://www.medicare.gov/coverage/skilled-nursing-facility-snf-care",
      category: "medicare_coverage"
    },
    {
      title: "Tour Smart Strategy",
      subtitle: "Best Times to Visit",
      description: "Visit communities during meal times (11:30am or 5pm) to assess food quality and resident engagement. Use our TourMate™ system to schedule and track multiple tours efficiently.",
      source: "Elder care experts recommend meal-time visits for accurate assessment",
      link: null,
      category: "touring_tips"
    },
    {
      title: "Instant Emergency Help",
      subtitle: "One-Touch Contact System",
      description: "Our emergency button connects you instantly to trained advisors who can guide you through urgent situations - hospital discharge, eviction notices, or sudden care needs.",
      source: "MySeniorValet 24/7 emergency support system",
      link: null,
      category: "emergency_support"
    },
    {
      title: "35,232 Communities",
      subtitle: "Complete North America Coverage",
      description: "Search every licensed community across USA, Canada, Mexico, and Puerto Rico. From luxury resorts to affordable housing - all verified, all transparent, all in one place.",
      source: "MySeniorValet comprehensive database - updated daily",
      link: null,
      category: "complete_coverage"
    },
    {
      title: "Memory Care Insights",
      subtitle: "Specialized Dementia Support",
      description: "Memory care averages $6,500/month but varies widely by state. Iowa averages $4,800 while Connecticut reaches $9,000. We show exact pricing for 8,000+ memory care units.",
      source: "Genworth 2024 Cost of Care Survey - Memory Care Analysis",
      link: "https://www.genworth.com/aging-and-you/finances/cost-of-care.html",
      category: "memory_care"
    },
    {
      title: "Medicaid Planning",
      subtitle: "Protect Your Assets Legally",
      description: "Most states allow $2,000 in assets for Medicaid, but your home, car, and $137,400 in spousal assets are protected. Start planning 5 years before you need care.",
      source: "Medicaid.gov - Asset protection and look-back periods",
      link: "https://www.medicaid.gov/medicaid/eligibility/index.html",
      category: "medicaid_planning"
    },
    {
      title: "Family Collaboration",
      subtitle: "Share Research Instantly",
      description: "Our FREE family tools let you share favorites, compare communities, schedule tours together, and make decisions as a team - even from different cities.",
      source: "MySeniorValet Family Collaboration Center - 100% Free",
      link: null,
      category: "family_tools"
    },
    {
      title: "Red Flag Warnings",
      subtitle: "What to Watch For",
      description: "Warning signs: Strong odors, high staff turnover, many residents sleeping midday, empty activity calendars. Our reviews and inspection reports help you spot issues early.",
      source: "National Center on Elder Abuse - Facility warning signs",
      link: "https://ncea.acl.gov/",
      category: "safety_awareness"
    },
    {
      title: "AI-Powered Matching",
      subtitle: "Natural Language Search",
      description: "Just describe what you need: 'Memory care near Boston under $5,000 with garden' and our AI finds perfect matches from 35,232 communities instantly.",
      source: "MySeniorValet AI Search - Powered by advanced language understanding",
      link: null,
      category: "ai_technology"
    },
    {
      title: "Real-Time Availability",
      subtitle: "No More Waiting Lists",
      description: "See live availability for every community. No more calling 20 places to find they're full. Green pins mean available now, yellow means limited spots, red means waitlist only.",
      source: "MySeniorValet Real-Time Availability System",
      link: null,
      category: "availability"
    },
    {
      title: "Complete Care Spectrum",
      subtitle: "Every Option Explained",
      description: "From 55+ active living ($2,000/mo) to skilled nursing ($10,000/mo), we explain all 10 care levels, costs, and services. Find exactly what you need at the right price.",
      source: "MySeniorValet Care Spectrum Guide - 10 levels of care",
      link: null,
      category: "care_education"
    },
    {
      title: "Tax Deductions Available",
      subtitle: "Save on Care Costs",
      description: "Medical expenses over 7.5% of income are tax deductible. Assisted living and memory care often qualify as medical expenses - potentially saving thousands annually.",
      source: "IRS Publication 502 - Medical and Dental Expenses",
      link: "https://www.irs.gov/publications/p502",
      category: "tax_benefits"
    },
    {
      title: "Long-Term Care Insurance",
      subtitle: "Use Your Benefits",
      description: "60% of people with long-term care insurance never use it. We help you understand your policy and find communities that accept your coverage directly.",
      source: "American Association for Long-Term Care Insurance",
      link: "https://www.aaltci.org/",
      category: "insurance_help"
    }
  ];

  // Randomize message order on component mount
  useEffect(() => {
    const shuffled = [...platformDifferentiators].sort(() => Math.random() - 0.5);
    setShuffledMessages(shuffled);
  }, []);

  const messages = shuffledMessages.length > 0 ? shuffledMessages : platformDifferentiators;

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
            <div className="relative">
              <img 
                src="/assets/gentleman-mascot.png" 
                alt="Your Personal Senior Living Valet"
                className="mascot-image"
              />
            </div>
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
                  {currentMessage.link ? (
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
                  ) : (
                    <span className="source-value">{currentMessage.source}</span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}