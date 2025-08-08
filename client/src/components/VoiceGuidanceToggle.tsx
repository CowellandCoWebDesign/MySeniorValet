import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface VoiceGuidanceToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function VoiceGuidanceToggle({ className = '', showLabel = true }: VoiceGuidanceToggleProps) {
  const { 
    isEnabled, 
    isSpeaking, 
    isSupported, 
    toggle, 
    speak, 
    stop,
    provideGuidance 
  } = useVoiceGuidance();

  if (!isSupported) {
    return null; // Hide if browser doesn't support speech synthesis
  }

  const handleQuickHelp = () => {
    speak("Here are some tips: Click any button or link to hear what it does. Use the search box to find communities. The filters help narrow your results. Click on community cards to see more details.", 'high');
  };

  const handleKeyboardShortcuts = () => {
    speak("Keyboard shortcuts: Press V to toggle voice guidance. Press H for help. Press Escape to stop current speech. Use Tab to navigate between elements.", 'high');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={toggle}
        className={`${isEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-green-300'} ${isSpeaking ? 'animate-pulse' : ''}`}
        title="Toggle voice guidance for accessibility"
      >
        {isEnabled ? (
          <>
            <Volume2 className="w-4 h-4" />
            {showLabel && <span className="ml-2 hidden sm:inline">Voice On</span>}
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            {showLabel && <span className="ml-2 hidden sm:inline">Voice Off</span>}
          </>
        )}
      </Button>

      {isEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-green-300"
              title="Voice guidance options"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleQuickHelp}>
              <Volume2 className="w-4 h-4 mr-2" />
              Quick Help
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleKeyboardShortcuts}>
              <Volume2 className="w-4 h-4 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => provideGuidance('welcome')}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Welcome Guide
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => provideGuidance('navigation')}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Navigation Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={stop}
              disabled={!isSpeaking}
            >
              <VolumeX className="w-4 h-4 mr-2" />
              Stop Speaking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isSpeaking && (
        <Button
          variant="outline"
          size="sm"
          onClick={stop}
          className="border-red-300 text-red-600 hover:bg-red-50"
          title="Stop current speech"
        >
          <VolumeX className="w-4 h-4" />
          {showLabel && <span className="ml-2 hidden sm:inline">Stop</span>}
        </Button>
      )}
    </div>
  );
}