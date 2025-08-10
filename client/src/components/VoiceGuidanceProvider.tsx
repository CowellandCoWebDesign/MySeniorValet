import { createContext, useContext, ReactNode } from 'react';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';

interface VoiceGuidanceContextType {
  settings: {
    enabled: boolean;
    rate: number;
    pitch: number;
    volume: number;
    voice: SpeechSynthesisVoice | null;
    autoReadNavigation: boolean;
    autoReadContent: boolean;
    keyboardShortcuts: boolean;
  };
  setSettings: (settings: any) => void;
  voices: SpeechSynthesisVoice[];
  speaking: boolean;
  listening: boolean;
  speak: (text: string, priority?: boolean) => void;
  stopSpeaking: () => void;
  announce: (message: string, priority?: boolean) => void;
  readFocusedElement: () => void;
  readPageContent: () => void;
  toggleListening: () => void;
}

const VoiceGuidanceContext = createContext<VoiceGuidanceContextType | null>(null);

export function VoiceGuidanceProvider({ children }: { children: ReactNode }) {
  const voiceGuidance = useVoiceGuidance();

  return (
    <VoiceGuidanceContext.Provider value={voiceGuidance}>
      {children}
    </VoiceGuidanceContext.Provider>
  );
}

export function useVoiceGuidanceContext() {
  const context = useContext(VoiceGuidanceContext);
  if (!context) {
    throw new Error('useVoiceGuidanceContext must be used within VoiceGuidanceProvider');
  }
  return context;
}