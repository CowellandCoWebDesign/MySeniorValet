import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceGuidanceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

interface VoiceGuidanceState {
  isEnabled: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  currentText: string;
  voices: SpeechSynthesisVoice[];
}

export function useVoiceGuidance(options: VoiceGuidanceOptions = {}) {
  const [state, setState] = useState<VoiceGuidanceState>({
    isEnabled: false,
    isSpeaking: false,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    currentText: '',
    voices: []
  });

  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (!state.isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setState(prev => ({ ...prev, voices }));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [state.isSupported]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('voiceGuidanceSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setState(prev => ({ ...prev, isEnabled: settings.isEnabled }));
    }
  }, []);

  const speak = useCallback((text: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    if (!state.isSupported || !state.isEnabled || !text.trim()) return;

    // Stop current speech if high priority
    if (priority === 'high' && currentUtterance.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = options.rate || 0.8; // Slower for seniors
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Use preferred voice or find a clear English voice
    if (options.voice) {
      const selectedVoice = state.voices.find(voice => voice.name === options.voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    } else {
      // Prefer female voices as they're often clearer for seniors
      const preferredVoice = state.voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || state.voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true, currentText: text }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false, currentText: '' }));
    };

    utterance.onerror = () => {
      setState(prev => ({ ...prev, isSpeaking: false, currentText: '' }));
    };

    currentUtterance.current = utterance;
    speechSynthesis.speak(utterance);
  }, [state.isSupported, state.isEnabled, state.voices, options]);

  const stop = useCallback(() => {
    if (state.isSupported) {
      speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false, currentText: '' }));
    }
  }, [state.isSupported]);

  const toggle = useCallback(() => {
    const newEnabled = !state.isEnabled;
    setState(prev => ({ ...prev, isEnabled: newEnabled }));
    
    // Save to localStorage
    localStorage.setItem('voiceGuidanceSettings', JSON.stringify({ isEnabled: newEnabled }));
    
    if (newEnabled) {
      speak("Voice guidance is now enabled. I'll help guide you through the platform.", 'high');
    } else {
      stop();
    }
  }, [state.isEnabled, speak, stop]);

  // Pre-defined guidance messages for common actions
  const guidanceMessages = {
    welcome: "Welcome to MySeniorValet. I'm here to help you find the perfect senior living community. You can use voice commands or click on any element to get guidance.",
    search: "You can search by entering a city, zip code, or location in the search box. I'll help you find communities in that area.",
    filters: "Use the filter buttons to narrow down your search. You can filter by living type, amenities, room types, and price range.",
    map: "The map shows all communities in your search area. Click on any marker to see details about that community.",
    list: "The list view shows detailed information about each community including pricing, amenities, and contact information.",
    community: "This community card shows key information like pricing, care types, and amenities. Click for more details or to contact them directly.",
    navigation: "Use the navigation menu at the top to access different sections like search, favorites, and your profile."
  };

  const announcePageChange = useCallback((pageName: string) => {
    if (!state.isEnabled) return;
    
    const messages = {
      home: "You're now on the MySeniorValet home page. From here you can start searching for senior living communities.",
      search: "You're now on the search page. Use the search tools to find communities that match your needs.",
      community: "You're viewing a community details page. Here you can see all information about this specific community.",
      profile: "You're on your profile page where you can manage your preferences and saved communities."
    };
    
    const message = messages[pageName as keyof typeof messages] || `You're now on the ${pageName} page.`;
    speak(message, 'normal');
  }, [state.isEnabled, speak]);

  const announceAction = useCallback((action: string, context?: string) => {
    if (!state.isEnabled) return;

    const actionMessages = {
      search_started: "Starting your search...",
      search_results: `Found ${context} communities matching your criteria.`,
      filter_applied: `Filter applied. ${context}`,
      community_selected: "Opening community details...",
      favorites_added: "Community added to your favorites.",
      contact_opened: "Opening contact information...",
      map_moved: "Map view updated with new communities in this area."
    };

    const message = actionMessages[action as keyof typeof actionMessages] || `${action} completed.`;
    speak(message, 'normal');
  }, [state.isEnabled, speak]);

  const provideGuidance = useCallback((element: string) => {
    if (!state.isEnabled) return;
    
    const message = guidanceMessages[element as keyof typeof guidanceMessages];
    if (message) {
      speak(message, 'normal');
    }
  }, [state.isEnabled, speak, guidanceMessages]);

  return {
    ...state,
    speak,
    stop,
    toggle,
    announcePageChange,
    announceAction,
    provideGuidance,
    guidanceMessages
  };
}