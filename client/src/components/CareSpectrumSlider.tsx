import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Link } from 'wouter';
import { ChevronRight, DollarSign, Heart, Shield, Brain, Home, Users, Stethoscope } from 'lucide-react';

interface CareLevel {
  level: number;
  name: string;
  badge: string;
  description: string;
  costRange: string;
  icon: React.ReactNode;
  color: string;
  searchValue: string;
}

const careLevels: CareLevel[] = [
  {
    level: 1,
    name: 'HUD-Sponsored Housing',
    badge: '🏷️ Income-Qualified',
    description: 'Federally subsidized apartments for seniors; income-restricted; no care',
    costRange: '$0–$500',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-blue-500',
    searchValue: 'hud_senior_housing'
  },
  {
    level: 2,
    name: '55+ Mobile Home Parks',
    badge: '🏕️ 55+ Mobile',
    description: 'Age-restricted, lease/own land or unit; no services',
    costRange: '$300–$800',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-green-500',
    searchValue: 'senior_mobile_park'
  },
  {
    level: 3,
    name: 'Active Adult 55+',
    badge: '🟢 Active Adult',
    description: 'Senior apartments, condos, or lifestyle neighborhoods',
    costRange: '$800–$1,500',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-emerald-500',
    searchValue: 'active_adult_55plus'
  },
  {
    level: 4,
    name: 'Independent Living',
    badge: '🟣 Independent',
    description: 'Private-pay retirement communities with meals/activities',
    costRange: '$1,500–$3,500+',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-purple-500',
    searchValue: 'independent_living'
  },
  {
    level: 5,
    name: 'Assisted Living',
    badge: '🔶 Assisted',
    description: 'Includes ADLs, meds, light nursing, meals',
    costRange: '$3,000–$6,000+',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-orange-500',
    searchValue: 'assisted_living'
  },
  {
    level: 6,
    name: 'Memory Care',
    badge: '🔴 Memory Care',
    description: 'Secured, structured dementia care',
    costRange: '$4,000–$7,500+',
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-red-500',
    searchValue: 'memory_care'
  },
  {
    level: 7,
    name: 'Skilled Nursing',
    badge: '🏥 Skilled Nursing',
    description: 'Medical, 24/7 nursing, rehab, often insurance-paid',
    costRange: '$6,000–$12,000+',
    icon: <Stethoscope className="w-5 h-5" />,
    color: 'bg-indigo-500',
    searchValue: 'skilled_nursing'
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
            max={7}
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