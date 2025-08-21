// Centralized loading facts for all loading screens
// These rotate randomly to provide fresh content on each loading screen

export const loadingFacts = [
  // Core Platform Facts
  {
    title: "MySeniorValet Database",
    fact: "We maintain real-time data on over 33,560 verified senior living communities across the United States, Canada, and Mexico - the most comprehensive trilingual database available."
  },
  {
    title: "Did You Know?",
    fact: "The average American family spends 73 hours researching senior living options. MySeniorValet reduces this to minutes with instant access to verified community information."
  },
  {
    title: "Transparency Mission",
    fact: "Less than 15% of senior living communities publicly display their pricing online. MySeniorValet is changing this by providing authentic HUD pricing and market estimates."
  },
  
  // Care Types Education
  {
    title: "Understanding Care Levels",
    fact: "Independent Living offers maintenance-free living with amenities, while Assisted Living provides help with daily activities like medication management and personal care."
  },
  {
    title: "Memory Care Insight",
    fact: "Memory care costs typically run 20-30% higher than assisted living due to specialized staffing, secure environments, and personalized programming for residents with dementia."
  },
  {
    title: "Skilled Nursing Facts",
    fact: "Skilled nursing facilities provide 24/7 medical care and rehabilitation services. Medicare may cover short-term stays after a qualifying hospital admission."
  },
  {
    title: "Continuing Care Communities",
    fact: "CCRCs offer a continuum of care from independent living through skilled nursing, allowing residents to age in place as their care needs change."
  },
  
  // Financial Planning
  {
    title: "Medicare Coverage",
    fact: "Medicare generally doesn't cover long-term assisted living costs, but it may cover short-term skilled nursing care after a hospital stay of 3+ days."
  },
  {
    title: "Veterans Benefits",
    fact: "Veterans and surviving spouses may qualify for Aid & Attendance benefits, providing up to $2,230/month to help cover senior care costs."
  },
  {
    title: "Long-Term Care Insurance",
    fact: "Long-term care insurance can cover 50-70% of assisted living costs, but policies must typically be purchased before age 65 and while in good health."
  },
  {
    title: "HUD Housing Programs",
    fact: "HUD Section 202 provides affordable housing for seniors 62+. Rent is typically 30% of adjusted income, making it accessible for fixed-income seniors."
  },
  
  // Geographic Insights
  {
    title: "Geographic Pricing",
    fact: "Senior living costs vary by up to 300% across different states. Alaska and Connecticut are the most expensive, while Missouri and Alabama offer more affordable options."
  },
  {
    title: "Urban vs Rural",
    fact: "Rural senior communities often cost 20-40% less than urban facilities, but may have fewer specialized services and longer distances to medical centers."
  },
  {
    title: "Regional Specialties",
    fact: "Florida leads the nation in active adult communities, while states like Minnesota excel in memory care innovation and dementia-friendly design."
  },
  
  // Industry Statistics
  {
    title: "Growing Demand",
    fact: "By 2030, all baby boomers will be 65+, creating unprecedented demand for senior living. The industry is expected to need 1 million new units by 2040."
  },
  {
    title: "Community Sizes",
    fact: "Senior living communities range from intimate 6-bed residential care homes to large continuing care retirement communities with over 500 residents."
  },
  {
    title: "Occupancy Trends",
    fact: "The average senior living community maintains 87% occupancy. Communities with higher ratings and transparent pricing typically achieve 95%+ occupancy."
  },
  
  // Health & Wellness
  {
    title: "Social Connection",
    fact: "Seniors in community living report 60% less loneliness than those living alone. Social engagement is linked to better cognitive health and longevity."
  },
  {
    title: "Fall Prevention",
    fact: "One in four Americans 65+ falls each year. Senior communities reduce fall risk by 40% through grab bars, emergency systems, and level flooring."
  },
  {
    title: "Medication Management",
    fact: "The average senior takes 5+ medications daily. Assisted living communities reduce medication errors by 85% through professional management systems."
  },
  
  // Technology & Innovation
  {
    title: "Virtual Tours",
    fact: "83% of families now expect virtual tour options when researching communities. MySeniorValet connects you directly to community websites for tours."
  },
  {
    title: "AI-Powered Matching",
    fact: "Our AI analyzes 50+ factors including care needs, budget, location preferences, and amenities to recommend the best community matches for your loved one."
  },
  {
    title: "Real-Time Updates",
    fact: "MySeniorValet's database updates daily with new communities, pricing changes, and availability status to ensure you have the latest information."
  },
  
  // Family Decision Making
  {
    title: "Family Involvement",
    fact: "70% of senior living decisions involve 3+ family members. MySeniorValet's save and share features help families collaborate on research."
  },
  {
    title: "Timing Matters",
    fact: "The average family waits until a health crisis to begin searching. Planning ahead provides 3x more options and better negotiating power."
  },
  {
    title: "Tour Tips",
    fact: "Visit communities at different times - morning for breakfast quality, afternoon for activities, and evening to observe staff-to-resident ratios."
  },
  
  // Quality Indicators
  {
    title: "Staff Ratios",
    fact: "Quality communities maintain a 1:8 caregiver-to-resident ratio during day shifts and 1:12 at night. Always ask about staffing levels."
  },
  {
    title: "Menu Variety",
    fact: "Top-rated communities offer 3+ menu choices per meal and accommodate special diets. Dining quality is the #1 resident satisfaction factor."
  },
  {
    title: "Activity Programs",
    fact: "Active communities offer 5+ daily activities including physical, cognitive, social, and creative programs tailored to resident interests."
  },
  
  // Platform Features
  {
    title: "Emergency Contact System",
    fact: "Our One-Touch Emergency Contact feature connects families instantly. Over 2,000 families use this for peace of mind during the search process."
  },
  {
    title: "TourMate™ Scheduling",
    fact: "TourMate™ helps you schedule and track community tours. The average family visits 5-7 communities before making a decision."
  },
  {
    title: "Multilingual Support",
    fact: "MySeniorValet offers full support in English, Spanish, and French, serving diverse families across North America with culturally relevant resources."
  },
  
  // Market Trends
  {
    title: "Pricing Transparency",
    fact: "Communities that display pricing online receive 40% more qualified inquiries and fill vacancies 25% faster than those requiring calls for pricing."
  },
  {
    title: "Pet-Friendly Trends",
    fact: "65% of seniors have pets. Pet-friendly communities report higher satisfaction scores and lower move-out rates among residents."
  },
  {
    title: "Green Living",
    fact: "Eco-friendly senior communities with gardens, solar power, and sustainable practices charge 10% premiums but maintain 98% occupancy rates."
  }
];

// Function to get random facts (excludes recently shown ones)
let recentFactIndices: number[] = [];

export function getRandomFact() {
  // If we've shown most facts, reset the recent list
  if (recentFactIndices.length >= loadingFacts.length - 5) {
    recentFactIndices = [];
  }
  
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * loadingFacts.length);
  } while (recentFactIndices.includes(randomIndex));
  
  recentFactIndices.push(randomIndex);
  return loadingFacts[randomIndex];
}

// Function to get a shuffled array of facts for continuous rotation
export function getShuffledFacts() {
  const shuffled = [...loadingFacts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}