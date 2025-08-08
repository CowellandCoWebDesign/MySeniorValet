import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';

const VoiceGuidanceContext = createContext<ReturnType<typeof useVoiceGuidance> | null>(null);

interface VoiceGuidanceProviderProps {
  children: ReactNode;
}

export function VoiceGuidanceProvider({ children }: VoiceGuidanceProviderProps) {
  const voiceGuidance = useVoiceGuidance({
    rate: 0.8, // Slower speech for seniors
    pitch: 1.0,
    volume: 1.0
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with paste
          e.preventDefault();
          voiceGuidance.toggle();
          break;
        
        case 'h':
          if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser shortcuts
          if (voiceGuidance.isEnabled) {
            e.preventDefault();
            voiceGuidance.provideGuidance('welcome');
          }
          break;
        
        case 'escape':
          if (voiceGuidance.isSpeaking) {
            e.preventDefault();
            voiceGuidance.stop();
          }
          break;

        case '?':
          if (voiceGuidance.isEnabled) {
            e.preventDefault();
            voiceGuidance.speak("Press V to toggle voice guidance, H for help, Escape to stop speech. Click any element to hear what it does.", 'high');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voiceGuidance]);

  // Welcome message on first enable
  useEffect(() => {
    if (voiceGuidance.isEnabled) {
      // Check if this is the first time enabling
      const hasWelcomed = localStorage.getItem('voiceGuidanceWelcomed');
      if (!hasWelcomed) {
        setTimeout(() => {
          voiceGuidance.speak("Welcome! Voice guidance is now active. I'll help you navigate MySeniorValet. Press H for help anytime, or click on any element to hear what it does.", 'high');
        }, 1000);
        localStorage.setItem('voiceGuidanceWelcomed', 'true');
      }
    }
  }, [voiceGuidance.isEnabled]);

  return (
    <VoiceGuidanceContext.Provider value={voiceGuidance}>
      {children}
    </VoiceGuidanceContext.Provider>
  );
}

export function useVoiceGuidanceContext() {
  const context = useContext(VoiceGuidanceContext);
  if (!context) {
    throw new Error('useVoiceGuidanceContext must be used within a VoiceGuidanceProvider');
  }
  return context;
}