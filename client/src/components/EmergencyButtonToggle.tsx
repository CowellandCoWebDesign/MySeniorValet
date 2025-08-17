import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export function EmergencyButtonToggle() {
  const { preferences, togglePreference } = useAccessibilityPreferences();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <div>
          <Label htmlFor="emergency-toggle" className="text-sm font-medium">
            Emergency Button
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Quick access to emergency contacts
          </p>
        </div>
      </div>
      <Switch
        id="emergency-toggle"
        checked={preferences.emergencyButton}
        onCheckedChange={() => togglePreference('emergencyButton')}
      />
    </div>
  );
}