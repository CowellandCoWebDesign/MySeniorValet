import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, AlertCircle, Sun, Moon, Clock, Shield, 
  HeartHandshake, CheckCircle, XCircle, Info, 
  Search, ArrowRight, BookOpen, Users, Home,
  Activity, Phone, Calendar, ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function MemoryCareDetailPage() {
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);

  const memoryCareLevels = [
    {
      stage: 'Early Stage',
      symptoms: ['Mild confusion', 'Short-term memory loss', 'Difficulty with complex tasks'],
      careNeeds: 'Minimal assistance, mainly reminders and supervision',
      environment: 'Can often remain at home with support'
    },
    {
      stage: 'Middle Stage',
      symptoms: ['Increased confusion', 'Difficulty recognizing familiar people', 'Behavioral changes'],
      careNeeds: 'Assistance with daily activities, structured routine',
      environment: 'Memory care often becomes necessary'
    },
    {
      stage: 'Late Stage',
      symptoms: ['Severe cognitive decline', 'Limited mobility', 'Complete dependence'],
      careNeeds: '24/7 care, assistance with all activities',
      environment: 'Specialized memory care unit essential'
    }
  ];

  const keyIndicators = [
    {
      id: 'exit-seeking',
      name: 'Exit Seeking / Wandering',
      icon: AlertCircle,
      color: 'text-red-600',
      description: 'Attempting to leave safe environments, getting lost, or wandering without purpose',
      details: [
        'May try to "go home" even when at home',
        'Attempts to leave at night',
        'Gets lost in familiar places',
        'Walks with no apparent destination'
      ],
      whyItMatters: 'Safety risk requiring secure environment and 24/7 supervision'
    },
    {
      id: 'sundowning',
      name: 'Sundowning Syndrome',
      icon: Sun,
      color: 'text-orange-600',
      description: 'Increased confusion, agitation, or restlessness in late afternoon/evening',
      details: [
        'Increased confusion after 4 PM',
        'Agitation or aggression in evening',
        'Difficulty sleeping at night',
        'Shadowing caregivers constantly'
      ],
      whyItMatters: 'Requires specialized evening routines and trained staff'
    },
    {
      id: 'sleep-disturbances',
      name: 'Sleep Pattern Disruption',
      icon: Moon,
      color: 'text-indigo-600',
      description: 'Reversed sleep cycles, nighttime activity, daytime drowsiness',
      details: [
        'Awake and active at night',
        'Sleeping during the day',
        'Frequent nighttime awakening',
        'Confusion about time of day'
      ],
      whyItMatters: 'Needs 24-hour awake staff and structured sleep programs'
    },
    {
      id: 'behavioral-changes',
      name: 'Behavioral & Mood Changes',
      icon: Activity,
      color: 'text-purple-600',
      description: 'Personality changes, aggression, depression, or inappropriate behaviors',
      details: [
        'Uncharacteristic aggression',
        'Inappropriate social behavior',
        'Severe mood swings',
        'Paranoia or hallucinations'
      ],
      whyItMatters: 'Requires trained staff in de-escalation and behavioral management'
    }
  ];

  const resources = [
    {
      name: "Alzheimer's Association 24/7 Helpline",
      phone: "1-800-272-3900",
      description: "Free support, information, and local resources",
      url: "https://www.alz.org"
    },
    {
      name: "VA Aid & Attendance Benefits",
      description: "Up to $2,795/month for eligible veterans and surviving spouses (VA 2024)",
      url: "https://www.va.gov"
    },
    {
      name: "Long-Term Care Ombudsman",
      phone: "1-800-677-1116",
      description: "Free advocacy for residents' rights and complaint resolution (ACL)",
      url: "https://ltcombudsman.org"
    },
    {
      name: "Medicaid HCBS Waivers",
      description: "Home and Community-Based Services covering memory care ($2,901/month income limit)",
      url: "https://www.medicaid.gov"
    }
  ];

  const costFactors = [
    { factor: 'Level of Care', impact: 'Higher needs = Higher cost', range: '$500-2000/month difference' },
    { factor: 'Location', impact: 'Urban areas cost more', range: '20-40% variance by region' },
    { factor: 'Room Type', impact: 'Private vs shared', range: '$1000-3000/month difference' },
    { factor: 'Facility Type', impact: 'Specialized vs general', range: '$1500-4000/month difference' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/"><Button variant="ghost" className="text-white mb-4">← Back to Home</Button></Link>
          
          <div className="flex items-center gap-4 mb-6">
            <Brain className="w-16 h-16" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Memory Care</h1>
              <p className="text-xl opacity-90">Complete Guide to Memory & Dementia Care</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">$5,500-9,000</div>
                <div className="text-sm opacity-90">Average Monthly Cost</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Specialized Care & Security</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">6.9M</div>
                <div className="text-sm opacity-90">Americans with Alzheimer's (NIH/NIA 2024)</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* When to Consider Memory Care */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Critical Indicators: When Memory Care Becomes Necessary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Understanding these key behavioral indicators helps families recognize when specialized memory care 
              is needed for safety and quality of life.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {keyIndicators.map((indicator) => {
                const Icon = indicator.icon;
                return (
                  <motion.div
                    key={indicator.id}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedIndicator(
                      selectedIndicator === indicator.id ? null : indicator.id
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-8 h-8 ${indicator.color} flex-shrink-0`} />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{indicator.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {indicator.description}
                        </p>
                        
                        {selectedIndicator === indicator.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 space-y-2"
                          >
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                              <p className="font-semibold text-sm mb-2">Warning Signs:</p>
                              <ul className="space-y-1">
                                {indicator.details.map((detail, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
                              <p className="text-sm">
                                <strong>Why This Matters:</strong> {indicator.whyItMatters}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stages of Memory Loss */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Understanding the Progression
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Source: National Institute on Aging (NIH/NIA) - Alzheimer's Disease Fact Sheet 2024
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoryCareLevels.map((level, index) => (
                <div key={index} className="border-l-4 border-blue-600 pl-4 py-3">
                  <h3 className="font-bold text-lg mb-2">{level.stage}</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Symptoms:</p>
                      <ul className="space-y-1">
                        {level.symptoms.map((symptom, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-gray-500">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Care Needs:</p>
                      <p>{level.careNeeds}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Environment:</p>
                      <p>{level.environment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Government Statistics */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-bold mb-3">Key Federal Statistics:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>6.9 million Americans</strong> currently living with Alzheimer's disease (NIH/NIA 2024)</li>
                <li>• <strong>15% or more</strong> of nursing home residents experience adverse drug events (FDA FAERS 2024)</li>
                <li>• <strong>198,502 complaints</strong> investigated by Long-Term Care Ombudsman programs nationwide (ACL 2024)</li>
                <li>• <strong>3.48 hours per resident day</strong> minimum nursing care required by CMS (effective 2026-2027)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* What Makes Memory Care Different */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              What Makes Memory Care Special
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3 text-green-600">Specialized Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Secure Environment:</strong> Locked units, alarmed doors, enclosed courtyards
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>CMS Staffing Standards:</strong> 3.48 hours per resident day, 24/7 RN coverage (CMS 2024)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Structured Programs:</strong> Memory-enhancing activities, sensory stimulation
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <strong>Wandering Prevention:</strong> GPS tracking, secured outdoor spaces
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-3 text-blue-600">Daily Structure</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Consistent Routines:</strong> Same meal times, activities, caregivers
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Small Group Activities:</strong> 6-8 residents per activity group
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <HeartHandshake className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Person-Centered Care:</strong> Tailored to individual history and preferences
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Home className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <strong>Familiar Environment:</strong> Memory boxes, personal items, clear signage
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Federal Quality & Safety Standards */}
            <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h4 className="font-bold mb-3 text-orange-800 dark:text-orange-300">Federal Quality & Safety Standards:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold mb-2">Medication Safety (FDA 2024):</p>
                  <ul className="space-y-1">
                    <li>• 15%+ adverse drug event rate in nursing homes</li>
                    <li>• 50% of events potentially preventable</li>
                    <li>• FAERS monitoring system active</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Quality Measures (AHRQ 2024):</p>
                  <ul className="space-y-1">
                    <li>• SOPS Survey 2.0 with 8 composite measures</li>
                    <li>• Pressure ulcer prevention tracking</li>
                    <li>• UTI reduction protocols</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              Understanding Memory Care Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                  National Average: $6,935/month
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Range: $3,500 - $12,000+ depending on location and care level
                </p>
              </div>
              
              <div className="space-y-3">
                {costFactors.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <p className="font-semibold">{item.factor}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.impact}</p>
                    </div>
                    <Badge variant="secondary">{item.range}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Federal Financial Assistance Programs */}
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-bold mb-3 text-green-800 dark:text-green-300">Federal Financial Assistance Available:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>VA Aid & Attendance:</strong> $2,358-$2,795/month for eligible veterans and surviving spouses (VA 2024)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>Medicaid HCBS Waivers:</strong> Income limit $2,901/month, covers home and community-based services (Medicaid 2024)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>HUD Section 202:</strong> $115M funding for affordable senior housing (HUD 2024)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <strong>PACE Programs:</strong> Serving 70,000+ participants at $7 billion annually (ACL 2024)
                  </div>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Essential Resources & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((resource, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg mb-2">{resource.name}</h3>
                  {resource.phone && (
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${resource.phone}`} className="text-blue-600 hover:underline">
                        {resource.phone}
                      </a>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{resource.description}</p>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    Visit Website <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search CTA */}
        <Card className="bg-gradient-to-r from-red-600 to-red-800 text-white">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Find Memory Care Communities Near You</h2>
            <p className="text-xl mb-6 opacity-90">
              Search from thousands of verified memory care facilities with transparent pricing
            </p>
            <Link href="/map-search?careType=memory">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                <Search className="w-5 h-5 mr-2" />
                Search Memory Care Communities
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Questions to Ask */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-6 h-6 text-yellow-600" />
              Questions to Ask When Touring Memory Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">About Safety & Security</h3>
                <ul className="space-y-2 text-sm">
                  <li>• How do you prevent wandering and exit-seeking?</li>
                  <li>• What security measures are in place?</li>
                  <li>• How do you handle medical emergencies?</li>
                  <li>• What is your staff-to-resident ratio?</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">About Care Approach</h3>
                <ul className="space-y-2 text-sm">
                  <li>• How do you handle sundowning behaviors?</li>
                  <li>• What training does staff receive for dementia care?</li>
                  <li>• How do you personalize care plans?</li>
                  <li>• What activities are specifically for memory care?</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}