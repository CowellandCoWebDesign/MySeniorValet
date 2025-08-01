import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface CommunityFilterPanelProps {
  selectedSubtypes: string[];
  onSubtypeChange: (subtypes: string[]) => void;
}

export const CommunityFilterPanel: React.FC<CommunityFilterPanelProps> = ({
  selectedSubtypes,
  onSubtypeChange
}) => {
  const housingTypes = [
    { value: 'hud_senior_housing', label: 'HUD-Sponsored Housing', badge: '🏷️ Income-Qualified | HUD Verified', color: 'bg-blue-500' },
    { value: 'senior_mobile_park', label: '55+ Mobile Parks', badge: '🏕️ 55+ Mobile', color: 'bg-green-500' },
    { value: 'active_adult_55plus', label: 'Active Adult 55+', badge: '🟢 Active Adult', color: 'bg-emerald-500' },
    { value: 'independent_living', label: 'Independent Living', badge: '🟣 Independent Living', color: 'bg-purple-500' },
    { value: 'assisted_living', label: 'Assisted Living', badge: '🔶 Assisted Living', color: 'bg-orange-500' },
    { value: 'memory_care', label: 'Memory Care', badge: '🔴 Memory Care', color: 'bg-red-500' },
    { value: 'board_and_care', label: 'Board & Care / RCFE', badge: '🏡 Board & Care', color: 'bg-yellow-600' },
    { value: 'skilled_nursing', label: 'Skilled Nursing', badge: '🏥 Skilled Nursing', color: 'bg-indigo-500' },
    { value: 'va_housing', label: 'Veteran Housing', badge: '🎖️ Veteran Housing', color: 'bg-slate-600' },
    { value: 'unlicensed_senior_housing', label: 'Unlicensed / Charity-Based', badge: '🕊️ Unlicensed Housing', color: 'bg-gray-500' }
  ];

  const handleSubtypeToggle = (subtype: string) => {
    if (selectedSubtypes.includes(subtype)) {
      onSubtypeChange(selectedSubtypes.filter(s => s !== subtype));
    } else {
      onSubtypeChange([...selectedSubtypes, subtype]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Housing Type</h3>
        <div className="space-y-2">
          {housingTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-3">
              <Checkbox
                id={type.value}
                checked={selectedSubtypes.includes(type.value)}
                onCheckedChange={() => handleSubtypeToggle(type.value)}
              />
              <Label 
                htmlFor={type.value} 
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <span>{type.label}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${type.color} text-white`}
                >
                  {type.badge}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};