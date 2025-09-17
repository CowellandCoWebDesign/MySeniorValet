import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrength {
  score: number;
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
  feedback: string[];
}

interface PasswordStrengthMeterProps {
  password: string;
  onChange?: (isValid: boolean) => void;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({ 
  password, 
  onChange,
  showRequirements = true 
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStrength = async () => {
      if (!password) {
        setStrength(null);
        onChange?.(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/auth/validate-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await response.json();
        setStrength(data);
        onChange?.(data.isValid);
      } catch (error) {
        console.error('Failed to validate password:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(checkStrength, 300);
    return () => clearTimeout(debounce);
  }, [password, onChange]);

  if (!password || !strength) {
    return null;
  }

  const getStrengthLabel = (score: number): string => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return 'bg-red-600';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-600';
  };

  const progressValue = (strength.score / 5) * 100;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password Strength:</span>
        <span className={`text-sm font-medium ${
          strength.score <= 2 ? 'text-red-600' : 
          strength.score <= 3 ? 'text-yellow-600' : 
          strength.score <= 4 ? 'text-blue-600' : 
          'text-green-600'
        }`}>
          {getStrengthLabel(strength.score)}
        </span>
      </div>
      
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
          style={{ width: `${progressValue}%` }}
        />
      </div>

      {showRequirements && (
        <div className="space-y-1 mt-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <RequirementItem 
              met={strength.requirements.minLength} 
              text="At least 8 characters" 
            />
            <RequirementItem 
              met={strength.requirements.hasUppercase} 
              text="One uppercase letter" 
            />
            <RequirementItem 
              met={strength.requirements.hasLowercase} 
              text="One lowercase letter" 
            />
            <RequirementItem 
              met={strength.requirements.hasNumber} 
              text="One number" 
            />
            <RequirementItem 
              met={strength.requirements.hasSpecialChar} 
              text="One special character" 
            />
            <RequirementItem 
              met={strength.requirements.notCommon} 
              text="Not a common password" 
            />
          </div>
        </div>
      )}

      {strength.feedback.length > 0 && !strength.isValid && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-800">
            {strength.feedback[0]}
          </p>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <X className="w-3 h-3 text-gray-400" />
      )}
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </div>
  );
}