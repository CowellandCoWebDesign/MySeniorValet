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
    description: 'Federally subsidized apartments for seniors; income-restricted; no care',
    fullDescription: 'Government-subsidized housing for low-income seniors, offering rent based on 30% of income with verified pricing. These communities provide safe, affordable housing with accessibility features and are regulated by federal oversight.',
    costRange: '$300-900/month',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-green-500',
    searchValue: 'hud_senior_housing',
    keyFeatures: [
      'Income-based rent (30% of income)',
      'Government subsidized',
      'Accessible units available',
      'Federal oversight and protection',
      'Utility allowances included'
    ],
    idealFor: 'Low-income seniors who are independent but need affordable housing with basic accessibility features'
  },
  {
    level: 2,
    name: '55+ Mobile Home Parks',
    badge: '🏕️ 55+ Mobile',
    description: 'Age-restricted, lease/own land or unit; no services',
    fullDescription: 'Senior RV and mobile parks offering flexible living for adventurous retirees who enjoy travel and community amenities. These communities provide an affordable housing option where residents can own their home while leasing the land.',
    costRange: '$400-1,200/month',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-orange-500',
    searchValue: 'senior_mobile_park',
    keyFeatures: [
      'Own your home, lease the land',
      'Community lifestyle with amenities',
      'Lower maintenance costs',
      'Pet-friendly options available',
      'Flexible, affordable living'
    ],
    idealFor: 'Active seniors seeking affordable homeownership with community amenities and minimal maintenance'
  },
  {
    level: 3,
    name: 'Active Adult 55+',
    badge: '🟢 Active Adult',
    description: 'Senior apartments, condos, or lifestyle neighborhoods',
    fullDescription: 'Age-restricted active adult communities for those 55 and older, focusing on lifestyle and social activities. These communities offer resort-style living with extensive amenities and social programs designed for active, independent seniors.',
    costRange: '$1,500-3,000/month',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-pink-600',
    searchValue: 'active_adult_55plus',
    keyFeatures: [
      'Active lifestyle focus with fitness centers',
      'Resort-style amenities (pools, golf)',
      'Social clubs and activities',
      'Age-restricted community (55+)',
      'No care services included'
    ],
    idealFor: 'Active, independent seniors who want a vibrant social lifestyle with resort-style amenities'
  },
  {
    level: 4,
    name: 'Independent Living',
    badge: '🟣 Independent',
    description: 'Private-pay retirement communities with meals/activities',
    fullDescription: 'Senior apartments and cottages for fully independent seniors who want maintenance-free living with optional services. These communities provide a perfect balance of independence and convenience with dining, housekeeping, and social programs included.',
    costRange: '$2,000-4,500/month',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-blue-600',
    searchValue: 'independent_living',
    keyFeatures: [
      'Private apartment or cottage living',
      'Maintenance-free lifestyle',
      'Daily meals included',
      'Housekeeping and laundry services',
      'Social and recreational programs'
    ],
    idealFor: 'Independent seniors who want to enjoy retirement without home maintenance responsibilities'
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
    description: 'Includes ADLs, meds, light nursing, meals',
    fullDescription: 'Assisted living communities offering 24/7 support with daily activities while maintaining independence. These communities provide personalized care plans, medication management, and assistance with activities of daily living in a residential setting.',
    costRange: '$3,500-7,000/month',
    icon: <HeartHandshake className="w-5 h-5" />,
    color: 'bg-red-600',
    searchValue: 'assisted_living',
    keyFeatures: [
      '24/7 care staff available',
      'Help with activities of daily living (ADLs)',
      'Medication management',
      'All meals and snacks included',
      'Personal care and grooming assistance'
    ],
    idealFor: 'Seniors who need help with daily activities but do not require full-time medical care'
  },
  {
    level: 7,
    name: 'Memory Care',
    badge: '🔴 Memory Care',
    description: 'Secured, structured dementia care',
    fullDescription: "Specialized memory care units for those with Alzheimer's and dementia, featuring secure environments and trained staff. These communities provide structured daily programs, specialized therapies, and a safe environment designed specifically for memory care needs.",
    costRange: '$4,500-9,000/month',
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-indigo-600',
    searchValue: 'memory_care',
    keyFeatures: [
      'Secure environment with controlled access',
      'Dementia-trained specialized staff',
      'Structured daily programs and routines',
      'Memory-enhancing activities and therapies',
      'Family support and education programs'
    ],
    idealFor: "Seniors with Alzheimer's, dementia, or other memory impairments requiring specialized care and security"
  },
  {
    level: 8,
    name: 'Skilled Nursing',
    badge: '🏥 Skilled Nursing',
    description: 'Medical, 24/7 nursing, rehab, often insurance-paid',
    fullDescription: 'Skilled nursing facilities providing 24-hour medical care and rehabilitation services for complex health needs. These facilities offer the highest level of medical care outside of a hospital, with registered nurses, therapists, and medical equipment on-site.',
    costRange: '$7,000-12,000/month',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'bg-cyan-600',
    searchValue: 'skilled_nursing',
    keyFeatures: [
      '24-hour nursing care and monitoring',
      'Rehabilitation services (physical, occupational, speech)',
      'Complex medical care and wound management',
      'Medicare/Medicaid coverage available',
      'Post-hospital recovery and long-term care'
    ],
    idealFor: 'Seniors with complex medical needs requiring 24-hour nursing care, rehabilitation, or post-hospital recovery'
  },
  {
    level: 9,
    name: 'CCRC',
    badge: '🏢 Life Plan Community',
    description: 'All care levels on one campus with lifetime care',
    fullDescription: 'Continuing Care Retirement Communities offering all levels of care on one campus with lifetime care contracts. These communities provide the security of knowing that as your care needs change, you can transition through different levels of care without leaving the community.',
    costRange: 'Entry: $100K-500K + $3-7K/mo',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-teal-600',
    searchValue: 'ccrc',
    keyFeatures: [
      'All levels of care on one campus',
      'Lifetime care guarantee',
      'Priority access to higher care levels',
      'Predictable monthly costs',
      'Single campus convenience for couples'
    ],
    idealFor: 'Seniors seeking long-term security with guaranteed access to all care levels as needs change'
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