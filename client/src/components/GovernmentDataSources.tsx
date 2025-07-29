import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  Shield,
  Database,
  Globe,
  MapPin,
  FileText,
  Heart,
  Home,
  Users,
  DollarSign,
  Flag
} from 'lucide-react';

interface DataSource {
  agency: string;
  description: string;
  dataTypes: string[];
  icon: React.ReactNode;
  badgeColor: string;
}

export function GovernmentDataSources() {
  // Federal Government Sources
  const federalSources: DataSource[] = [
    {
      agency: 'US Census Bureau',
      description: 'Area median income, demographic data, housing characteristics',
      dataTypes: ['Area Median Income', 'Senior Population Demographics', 'Housing Cost Index'],
      icon: <Database className="h-5 w-5" />,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      agency: 'Bureau of Labor Statistics',
      description: 'Regional cost of living indices, wage data',
      dataTypes: ['Cost of Living Index', 'Regional Price Parities', 'Consumer Price Index'],
      icon: <DollarSign className="h-5 w-5" />,
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      agency: 'HHS Area Agency on Aging',
      description: 'Local market surveys, aging services data',
      dataTypes: ['Senior Services Cost', 'Aging Network Data', 'Care Coordination Cost'],
      icon: <Heart className="h-5 w-5" />,
      badgeColor: 'bg-red-100 text-red-800'
    },
    {
      agency: 'State Medicaid Programs',
      description: 'Reimbursement rates by region, waiver programs',
      dataTypes: ['Medicaid Reimbursement Rates', 'Waiver Program Rates', 'LTSS Rates'],
      icon: <Shield className="h-5 w-5" />,
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      agency: 'VA Medical Centers',
      description: 'Veterans benefits acceptance rates, VA community partnerships',
      dataTypes: ['VA Benefits Acceptance', 'Community Living Centers', 'Aid & Attendance'],
      icon: <Flag className="h-5 w-5" />,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      agency: 'USDA Rural Development',
      description: 'Rural housing assistance data, rural senior housing grants',
      dataTypes: ['Rural Housing Assistance', 'Section 515 Properties', 'Rural Senior Housing'],
      icon: <Home className="h-5 w-5" />,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      agency: 'HUD - US Department of Housing and Urban Development',
      description: 'Comprehensive housing data including manufactured housing and senior properties',
      dataTypes: [
        'Manufactured Housing Community Database',
        'Section 202 Supportive Housing for the Elderly',
        'Low Income Housing Tax Credit Properties',
        'Public Housing Authority Contact Information',
        'HUD Multifamily Properties Database'
      ],
      icon: <Building2 className="h-5 w-5" />,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    }
  ];

  // State and Local Sources
  const stateLocalSources: DataSource[] = [
    {
      agency: 'State Health Departments',
      description: 'Unlicensed housing registry, non-medical senior communities',
      dataTypes: [
        'Independent Living Apartments',
        'Mobile Home Parks (age-restricted)',
        'RV Parks (senior residents)',
        'Active Adult Communities'
      ],
      icon: <Building2 className="h-5 w-5" />,
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      agency: 'State Housing Finance Agencies',
      description: 'Affordable senior housing developments across all states',
      dataTypes: ['Tax Credit Properties', 'Bond-Financed Developments', 'Senior Housing Registry'],
      icon: <Home className="h-5 w-5" />,
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      agency: 'County/City Planning Departments',
      description: 'Local zoning and permit data for senior communities',
      dataTypes: ['Mobile Home Park Permits', 'Age-Restricted Zoning', 'Senior Housing Development Plans'],
      icon: <MapPin className="h-5 w-5" />,
      badgeColor: 'bg-pink-100 text-pink-800'
    }
  ];

  // State-Specific Agencies
  const stateSpecificAgencies = [
    {
      state: 'California',
      agency: 'Department of Housing and Community Development',
      focus: 'Manufactured housing communities, mobile home parks'
    },
    {
      state: 'Texas',
      agency: 'Department of Housing and Community Affairs',
      focus: 'Manufactured housing, senior apartments'
    },
    {
      state: 'Florida',
      agency: 'Department of Business and Professional Regulation',
      focus: 'Mobile home parks, RV resorts, 55+ communities'
    },
    {
      state: 'Arizona',
      agency: 'Department of Housing',
      focus: 'Senior housing registry, age-restricted communities'
    },
    {
      state: 'New York',
      agency: 'Homes and Community Renewal',
      focus: 'Senior affordable housing, supportive housing'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Federal Sources Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span>Federal Government Data Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {federalSources.map((source, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 text-blue-600">{source.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{source.agency}</h4>
                    <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {source.dataTypes.map((type, typeIndex) => (
                        <Badge 
                          key={typeIndex} 
                          variant="secondary" 
                          className={`text-xs ${source.badgeColor}`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* State & Local Sources Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-6 w-6" />
            <span>State & Local Government Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 mb-6">
            {stateLocalSources.map((source, index) => (
              <div key={index} className="border-l-4 border-emerald-500 pl-4 py-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 text-emerald-600">{source.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{source.agency}</h4>
                    <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {source.dataTypes.map((type, typeIndex) => (
                        <Badge 
                          key={typeIndex} 
                          variant="secondary" 
                          className={`text-xs ${source.badgeColor}`}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* State-Specific Agencies */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-600" />
              State-Specific Housing Agencies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stateSpecificAgencies.map((agency, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{agency.state}</div>
                  <div className="text-sm text-gray-600">{agency.agency}</div>
                  <div className="text-xs text-gray-500 mt-1">Focus: {agency.focus}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3 italic">
              Plus 45 additional state agencies covering all US states and territories
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Integration Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Comprehensive Government Data Integration</h4>
              <p className="text-sm text-gray-600 mt-1">
                MySeniorValet integrates data from over 60+ federal, state, and local government sources 
                to provide the most comprehensive and accurate senior living information available. 
                All data is verified and updated regularly to ensure accuracy and compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}