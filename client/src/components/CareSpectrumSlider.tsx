import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Link } from 'wouter';
import { ChevronRight, DollarSign, Heart, Shield, Brain, Home, Users, Stethoscope, CheckCircle, Building2, HeartHandshake, Building } from 'lucide-react';

interface CareLevel {
  level: number;
  name: string;
  badge: string;
  description: string;
  fullDescription: string;
  costRange: string;
  icon: React.ReactNode;
  color: string;
  searchValue: string;
  keyFeatures: string[];
  idealFor: string;
}

const careLevels: CareLevel[] = [
  {
    level: 1,
    name: 'HUD-Sponsored Housing',
    badge: '🏷️ Income-Qualified',
    description: 'Section 202 PRAC housing for very low-income seniors (50% AMI or below)',
    fullDescription: 'HUD Section 202 Supportive Housing for the Elderly provides government-subsidized apartments for seniors 62+ who qualify as "Very Low Income" (50% of Area Median Income or below). Through the PRAC (Project Rental Assistance Contract) program, residents pay only 30% of their adjusted income while HUD covers the remaining housing costs. No new funding since 2012, but existing properties continue operating.',
    costRange: '30% of income',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-green-500',
    searchValue: 'hud_senior_housing',
    keyFeatures: [
      'Income limit: 50% of Area Median Income (AMI)',
      'Residents pay only 30% of adjusted income',
      'Service coordinator funded if 25%+ residents are frail',
      'Supportive services: nutrition, transportation, health programs',
      'Long waiting lists due to high demand',
      'Must contact properties directly to apply'
    ],
    idealFor: 'Very low-income seniors 62+ who need affordable housing with supportive services'
  },
  {
    level: 2,
    name: '55+ Mobile Home Parks',
    badge: '🏕️ 55+ Mobile',
    description: 'Own home, lease land - lot rent $300-1,200/month by region',
    fullDescription: '55+ mobile home parks and RV communities where residents own their manufactured home or RV while paying monthly lot rent. National average lot rent $300-400/month, but ranges from $200 in rural areas to $1,200+ in California coastal regions. Resident-Owned Communities (ROC) offer more stable pricing at $298-301/month. Premium RV resorts can reach $2,000+/month with luxury amenities.',
    costRange: '$300-1,200/month lot rent',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-orange-500',
    searchValue: 'senior_mobile_park',
    keyFeatures: [
      'Lot rent: $300-400 national average (varies by state)',
      'California: $440-1,200+, Florida: $300-1,000+',
      'Basic utilities typically included in lot rent',
      'Amenities: clubhouse, pool, activities vary by price',
      'Annual lot rent increases 3-7% typical',
      'Resident-Owned Communities offer price stability'
    ],
    idealFor: 'Seniors seeking affordable homeownership with flexible living arrangements'
  },
  {
    level: 3,
    name: 'Active Adult 55+',
    badge: '🟢 Active Adult',
    description: 'Resort-style ownership communities - homes $200k-1M+, HOA $99-800/month',
    fullDescription: 'Active adult 55+ communities offer resort-style living with home ownership. Home prices range from $200k to over $1M depending on location (Florida $200-600k, Arizona $300k-1M+, Nevada $400-800k). Monthly HOA fees $99-800 cover amenities like championship golf courses, 25,000+ sq ft clubhouses, full-service spas, restaurants, fitness centers, and 175+ resident clubs. These operate like vacation resorts with hospitality-trained staff.',
    costRange: 'HOA $99-800/month',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-pink-600',
    searchValue: 'active_adult_55plus',
    keyFeatures: [
      'Home purchase: $200k-1M+ (varies by region)',
      'HOA fees: $99-250 basic, $250-400 standard, $400-800 luxury',
      'Championship golf courses, up to 16 pickleball courts',
      'Full-service restaurants, bars, spas on-site',
      'Maintenance-free living with concierge services',
      'Popular: Del Webb, Sun City, Trilogy, Latitude Margaritaville'
    ],
    idealFor: 'Active seniors seeking resort-style retirement with homeownership and premium amenities'
  },
  {
    level: 4,
    name: 'Independent Living',
    badge: '🟣 Independent',
    description: 'Senior rental apartments with services - $3,065-3,145/month national median',
    fullDescription: 'Independent living communities provide private apartments (studio to 2-bedroom) with services for seniors who don\'t need daily care. National median cost $3,065-3,145/month including 1-3 meals daily, housekeeping, utilities, 24-hour security, scheduled transportation, fitness centers, and social programs. Ranges from $1,282/month (Mississippi) to $6,162/month (Maine). No medical care provided - residents must manage their own medications and health needs.',
    costRange: '$3,065-3,145/month',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-blue-600',
    searchValue: 'independent_living',
    keyFeatures: [
      'National median: $3,065-3,145/month all-inclusive',
      'Chef-prepared meals (1-3 daily) in restaurant-style dining',
      'Weekly housekeeping, linen service, maintenance',
      'Transportation to medical appointments and shopping',
      'Fitness centers, pools, classes, 24-hour security',
      '30-50% less expensive than assisted living'
    ],
    idealFor: 'Independent seniors 55+ (average age 74-75) wanting maintenance-free lifestyle with social engagement'
  },
  {
    level: 5,
    name: 'Personal Care Home',
    badge: '🏠 Personal Care',
    description: 'Private residential homes limited to 6-10 residents by state regulations',
    fullDescription: 'Personal care homes are privately owned small residential homes that provide 24-hour supervision and assistance with daily living. Due to state licensing regulations for private owners, these facilities are strictly limited to 6-10 beds maximum, creating an intimate, family-like environment. Also known as Adult Family Homes, Board & Care Homes, or Residential Care Homes depending on the state.',
    costRange: '$2,500-5,000/month',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-yellow-500',
    searchValue: 'personal_care',
    keyFeatures: [
      'Maximum 6-10 residents due to licensing regulations',
      'Privately owned and operated residential homes',
      '24-hour supervision and personal care assistance',
      'Higher staff-to-resident ratio (typically 1:3-4)',
      'Home-cooked meals in a family-style setting',
      'Located in residential neighborhoods'
    ],
    idealFor: 'Seniors who need assistance with daily activities but prefer a small, home-like environment over larger institutional facilities'
  },
  {
    level: 6,
    name: 'Assisted Living',
    badge: '🔶 Assisted',
    description: 'ADL assistance with 24-hour staff - $5,190-6,129/month national median',
    fullDescription: 'Assisted living facilities provide housing and personal care for seniors needing help with Activities of Daily Living (ADLs) like bathing, dressing, medication management. National median $5,190-6,129/month ($62,280-73,548 annually). Staff-to-resident ratios average 1:8 during day shifts, though only 12 states mandate minimum staffing. Care often tiered: Level 1 (1-2 ADLs), Level 2 (3 ADLs), Level 3+ (4+ ADLs) with corresponding price increases.',
    costRange: '$5,190-6,129/month',
    icon: <HeartHandshake className="w-5 h-5" />,
    color: 'bg-red-600',
    searchValue: 'assisted_living',
    keyFeatures: [
      'National median: $5,190-6,129/month (varies by state)',
      'Personal care: bathing, dressing, grooming, toileting',
      'Medication management by licensed nurses',
      'Staff ratios: typically 1:8 days, 1:15 nights',
      'Tiered pricing based on care levels (1-3+ ADLs)',
      'Move-in fees: $1,000-5,000 typical'
    ],
    idealFor: 'Seniors needing regular help with 1-4 daily activities but not 24-hour skilled nursing'
  },
  {
    level: 7,
    name: 'Memory Care',
    badge: '🔴 Memory Care',
    description: 'Secure dementia/Alzheimer\'s care - $6,450-7,292/month national median',
    fullDescription: 'Memory care facilities provide specialized secure environments for dementia and Alzheimer\'s residents. National median $6,450-7,292/month ($77,400-87,500 annually). Costs 30% higher than assisted living due to specialized staff training, enhanced security (locked doors, tracking systems), lower staff-to-resident ratios, and therapeutic programming. Average stay 2-3 years with total costs $190,000-285,000. Includes 24/7 supervision, cognitive stimulation therapies, and wandering prevention.',
    costRange: '$6,450-7,292/month',
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-indigo-600',
    searchValue: 'memory_care',
    keyFeatures: [
      'National median: $6,450-7,292/month',
      'Secure environment with wandering prevention systems',
      'Staff specialized in dementia/Alzheimer\'s care',
      'Structured routines, cognitive stimulation therapies',
      'Music and art therapy programs',
      'Average stay: 2-3 years (total $190k-285k)'
    ],
    idealFor: 'Individuals with Alzheimer\'s, dementia, or cognitive impairments needing 24/7 specialized secure care'
  },
  {
    level: 8,
    name: 'Skilled Nursing',
    badge: '🏥 Skilled Nursing',
    description: '24/7 medical care - Medicare covers 20 days, then $209.50/day copay',
    fullDescription: 'Skilled nursing facilities (SNFs) provide 24-hour medical care and rehabilitation. Medicare Part A covers first 20 days fully after qualifying 3-day hospital stay. Days 21-100: $209.50/day copayment. After day 100: patient pays all costs. Private pay rates: $314/day semiprivate ($9,555/month) or $361/day private room ($10,965/month). Includes nursing care, therapy (PT/OT/Speech), medications, medical equipment. Medicaid covers long-term stays at ~70% of private rates.',
    costRange: '$9,555-10,965/month',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'bg-cyan-600',
    searchValue: 'skilled_nursing',
    keyFeatures: [
      'Medicare: Days 1-20 free, 21-100 $209.50/day copay',
      'Private pay: $314/day semiprivate, $361/day private',
      'Requires 3-day hospital stay for Medicare coverage',
      '24-hour licensed nursing supervision',
      'Physical, occupational, speech therapy included',
      'Post-acute rehabilitation and complex medical care'
    ],
    idealFor: 'Post-hospital patients needing rehabilitation or individuals requiring 24/7 skilled medical care'
  },
  {
    level: 9,
    name: 'CCRC',
    badge: '🏢 Life Plan Community',
    description: 'Life Plan Communities - entrance fees $100k-2M + monthly $2,500-6,000',
    fullDescription: 'Continuing Care Retirement Communities (CCRCs/Life Plan Communities) offer all care levels on one campus. Entrance fees average $300-400k (range $100k-2M+) plus monthly fees $2,500-6,000. Three contract types: Type A Life Care (highest entrance, no added costs for care), Type B Modified (mid-range, limited care days included), Type C Fee-for-Service (lowest entrance, pay market rates). Refund options: 0%, 50%, 75%, or 90% to estate. 91.6% occupancy rate shows strong demand.',
    costRange: 'Entrance $300k + $3,747/mo',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-teal-600',
    searchValue: 'ccrc',
    keyFeatures: [
      'Entrance fees: $100k-2M (avg $300-400k)',
      'Monthly fees: $2,500-6,000 (avg $3,747)',
      'Type A: Highest entrance, predictable lifetime costs',
      'Type B: Moderate fees, some care days included',
      'Type C: Lowest entrance, pay as you go for care',
      'Refund options: 0-90% to resident/estate'
    ],
    idealFor: 'Affluent seniors wanting predictable lifetime care costs with ability to age in place on one campus'
  }
];

export function CareSpectrumSlider() {
  const [selectedLevel, setSelectedLevel] = useState([4]); // Default to Independent Living
  const currentLevel = careLevels.find(l => l.level === selectedLevel[0]) || careLevels[3];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-700">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Find Your Perfect Care Level
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Slide to explore the full spectrum of senior housing options
          </p>
        </div>

        {/* Current Selection Display */}
        <div className={`rounded-lg p-4 mb-6 ${currentLevel.color} bg-opacity-10 dark:bg-opacity-20 border-2 border-current`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentLevel.color} bg-opacity-20 text-white`}>
                {currentLevel.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {currentLevel.name}
                </h4>
                <Badge className={`${currentLevel.color} text-white text-xs px-2 py-1`}>
                  {currentLevel.badge}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentLevel.costRange}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {currentLevel.description}
          </p>
          <Link href={`/map-search?subtype=${currentLevel.searchValue}`}>
            <button className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
              Explore {currentLevel.name} Communities
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Slider */}
        <div className="relative mb-6">
          <div className="flex justify-between mb-4">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Lowest Cost
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              Highest Care
              <Heart className="w-3 h-3" />
            </span>
          </div>
          
          <Slider
            value={selectedLevel}
            onValueChange={setSelectedLevel}
            min={1}
            max={9}
            step={1}
            className="mb-4"
          />

          {/* Level Markers */}
          <div className="flex justify-between px-2">
            {careLevels.map((level) => (
              <div
                key={level.level}
                className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  level.level === selectedLevel[0] 
                    ? 'opacity-100 scale-110' 
                    : 'opacity-60 hover:opacity-80'
                }`}
                onClick={() => setSelectedLevel([level.level])}
              >
                <div className={`w-2 h-2 rounded-full ${level.color} mb-1`} />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium hidden sm:block">
                  {level.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Description Section */}
        <div className="border-t pt-6 mb-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              About {currentLevel.name}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentLevel.fullDescription}
            </p>
          </div>

          {/* Key Features */}
          <div className="mb-4">
            <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Key Features & Services
            </h5>
            <div className="grid gap-2">
              {currentLevel.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className={`h-4 w-4 ${currentLevel.color.replace('bg-', 'text-')} mt-0.5 flex-shrink-0`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal For Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Ideal For:
            </h5>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              {currentLevel.idealFor}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/map-search?subtype=hud_senior_housing">
            <button className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              View All HUD Properties
            </button>
          </Link>
          <Link href="/quiz">
            <button className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-2 px-3 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
              Take Care Assessment Quiz
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}