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
  
  // Platform differentiator facts based on real documented family feedback and industry investigations
  const platformDifferentiators = [
    {
      title: "No $10,000+ Referral Fees",
      subtitle: "Anti-A Place for Mom Promise",
      description: "A Place for Mom charges facilities ~$10,000 per placement, driving up costs for all residents. We're 100% family-funded with zero referral fees - saving families thousands.",
      source: "Washington Post 2024: A Place for Mom charges ~1 month's rent per referral",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "no_referral_fees"
    },
    {
      title: "Real Safety Information",
      subtitle: "See What They Hide",
      description: "Washington Post found 37% of A Place for Mom's 'Best of' award winners had serious care violations. We show state inspection reports, not fake marketing awards.",
      source: "Washington Post investigation: 324 of 863 award winners had serious violations",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "safety_transparency"
    },
    {
      title: "No Fake Reviews",
      subtitle: "Authentic Family Feedback",
      description: "A Place for Mom facilities routinely solicit fake 5-star reviews - one facility got 40 identical reviews in a single day. We verify all feedback through authenticated families.",
      source: "Washington Post: StoryPoint Saline had 40 five-star reviews posted on same day",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "authentic_reviews"
    },
    {
      title: "Senate Investigation Proof",
      subtitle: "Government Scrutiny",
      description: "Senator Bob Casey launched federal probe of A Place for Mom for 'deceptive marketing practices' and putting seniors at risk. We operate with full transparency.",
      source: "NBC News 2024: Senate announces probe of A Place for Mom referral service",
      link: "https://www.nbcnews.com/news/us-news/senate-announces-probe-place-for-mom-referral-service-rcna157282",
      category: "government_accountability"
    },
    {
      title: "Stop Financial Exploitation",
      subtitle: "Asset Protection Focus",
      description: "Medicaid attorney analysis shows A Place for Mom referrals force families to 'go broke faster' by excluding affordable Medicaid facilities to maximize their profits.",
      source: "Medicaid Planning.org: 'A Place for Mom to Go Broke' - faster asset depletion",
      link: "https://medicaidplanning.org/a-place-for-mom-to-go-broke/",
      category: "financial_protection"
    },
    {
      title: "No Harassment Campaigns",
      subtitle: "Respectful Communication",
      description: "Families report A Place for Mom calling '20+ times within 24 hours' and sharing contact info with 30+ facilities without consent. We respect your privacy and timeline.",
      source: "Consumer complaints: 8am-9pm daily calls, information shared without consent",
      link: "https://www.bbb.org/us/wa/seattle/profile/senior-care/a-place-for-mom-inc-1296-22011038/complaints",
      category: "no_pressure"
    },
    {
      title: "Include ALL Options",
      subtitle: "Complete Care Spectrum",
      description: "Competitors exclude Medicaid facilities and HUD housing because they don't pay referral fees. We show every option including ones that could save you $3,000+ monthly.",
      source: "Industry analysis: Anti-kickback laws prevent Medicaid referral fees",
      link: "https://medicaidplanning.org/a-place-for-mom-to-go-broke/",
      category: "complete_spectrum"
    },
    {
      title: "Real Family Stories",
      subtitle: "Documented Cases",
      description: "Judy Bottum's mother died alone at A Place for Mom facility with no showers in final month. We prioritize quality care over marketing relationships.",
      source: "Washington Post: Kathleen Bottum case at StoryPoint facility",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "quality_focus"
    },
    {
      title: "No Forced Relocations",
      subtitle: "Placement Stability",
      description: "Elder law experts warn A Place for Mom referrals often require expensive private-pay before Medicaid acceptance, forcing traumatic relocations when money runs out.",
      source: "Medicaid Planning analysis: Forced transitions when private funds exhausted",
      link: "https://medicaidplanning.org/a-place-for-mom-to-go-broke/",
      category: "placement_stability"
    },
    {
      title: "Transparent Business Model",
      subtitle: "No Hidden Agendas",
      description: "Harvard professor calls A Place for Mom 'pay-to-play model' with financial incentives that override care quality. Our transparent funding serves families, not facilities.",
      source: "Harvard healthcare policy expert David Grabowski quoted in Washington Post",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "transparency"
    },
    {
      title: "Professional Advocacy",
      subtitle: "Real Healthcare Background",
      description: "Placement agents often lack healthcare training and prioritize quick sales over proper matches. Our team includes certified care coordinators and elder law consultation.",
      source: "Industry insider: 'Most advisors are sales professionals, not healthcare experts'",
      link: "https://medicaidplanning.org/a-place-for-mom-to-go-broke/",
      category: "professional_expertise"
    },
    {
      title: "Government Data Integration",
      subtitle: "Beyond Marketing Materials",
      description: "We integrate live HUD databases, CMS star ratings, and state inspection reports. Competitors rely on manipulated reviews and marketing copy that hides problems.",
      source: "Post analysis: A Place for Mom excludes government inspection data from profiles",
      link: "https://www.washingtonpost.com/business/2024/05/16/place-for-mom-assisted-living-referral/",
      category: "verified_data"
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