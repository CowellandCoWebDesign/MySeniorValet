import React, { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';

interface AccessibleButtonProps extends ButtonProps {
  children: ReactNode;
  voiceDescription?: string;
  onVoiceClick?: () => void;
}

export function AccessibleButton({ 
  children, 
  voiceDescription, 
  onVoiceClick,
  onClick,
  ...props 
}: AccessibleButtonProps) {
  const { speak, isEnabled } = useVoiceGuidance();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Announce the action if voice guidance is enabled
    if (isEnabled && voiceDescription) {
      speak(voiceDescription, 'normal');
    }

    // Call custom voice action if provided
    if (onVoiceClick) {
      onVoiceClick();
    }

    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Provide help on question mark key
    if (e.key === '?' && isEnabled && voiceDescription) {
      e.preventDefault();
      speak(`This button: ${voiceDescription}`, 'high');
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-describedby={voiceDescription ? 'voice-description' : undefined}
    >
      {children}
    </Button>
  );
}