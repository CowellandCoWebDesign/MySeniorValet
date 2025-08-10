import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceSettings {
  enabled: boolean;
  rate: number; // 0.5 to 2
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  voice: SpeechSynthesisVoice | null;
  autoReadNavigation: boolean;
  autoReadContent: boolean;
  keyboardShortcuts: boolean;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  enabled: false,
  rate: 0.9, // Slightly slower for seniors
  pitch: 1,
  volume: 0.8,
  voice: null,
  autoReadNavigation: true,
  autoReadContent: true,
  keyboardShortcuts: true,
};

export function useVoiceGuidance() {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const stored = localStorage.getItem('voiceGuidanceSettings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const speechQueue = useRef<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.log('Speech synthesis not available');
      return;
    }

    const loadVoices = () => {
      try {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices.filter(v => v.lang.startsWith('en')));
        
        // Set default voice if not set
        if (!settings.voice && availableVoices.length > 0) {
          const preferredVoice = availableVoices.find(v => 
            v.name.includes('Microsoft') || v.name.includes('Google')
          ) || availableVoices[0];
          
          setSettings(prev => ({ ...prev, voice: preferredVoice }));
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };

    // Try loading immediately
    loadVoices();
    
    // Also listen for voices changed event
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback: try again after a delay
    const timer = setTimeout(loadVoices, 100);

    return () => {
      clearTimeout(timer);
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('voiceGuidanceSettings', JSON.stringify(settings));
  }, [settings]);

  // Speak text with current settings
  const speak = useCallback((text: string, priority = false) => {
    if (!settings.enabled || !text) return;

    if (priority) {
      // Cancel current speech for priority messages
      window.speechSynthesis.cancel();
      speechQueue.current = [];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    if (settings.voice) {
      utterance.voice = settings.voice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      // Process next in queue
      if (speechQueue.current.length > 0) {
        const next = speechQueue.current.shift();
        if (next) speak(next);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [settings]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    speechQueue.current = [];
    setSpeaking(false);
  }, []);

  // Announce for screen readers and voice guidance
  const announce = useCallback((message: string, priority = false) => {
    // Create ARIA live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', priority ? 'assertive' : 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    // Also speak if voice guidance is enabled
    speak(message, priority);
  }, [speak]);

  // Read focused element
  const readFocusedElement = useCallback(() => {
    const focused = document.activeElement;
    if (!focused) return;

    let text = '';
    
    // Get aria-label first
    const ariaLabel = focused.getAttribute('aria-label');
    if (ariaLabel) {
      text = ariaLabel;
    } else if (focused.textContent) {
      text = focused.textContent;
    }

    // Add role information
    const role = focused.getAttribute('role') || focused.tagName.toLowerCase();
    const roleText = {
      button: 'button',
      link: 'link',
      navigation: 'navigation menu',
      search: 'search field',
      textbox: 'text input',
      img: 'image',
    }[role] || role;

    if (text) {
      speak(`${text}, ${roleText}. Press Enter to activate.`);
    }
  }, [speak]);

  // Initialize voice recognition
  const initializeVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Commands Unavailable",
        description: "Your browser doesn't support voice commands.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(command);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event);
      setListening(false);
      if (event.error !== 'no-speech') {
        toast({
          title: "Voice Command Error",
          description: "Could not understand. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, [toast]);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    announce(`Processing command: ${command}`);

    // Navigation commands
    if (command.includes('home') || command.includes('go home')) {
      window.location.href = '/';
    } else if (command.includes('search')) {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]');
      if (searchInput instanceof HTMLElement) {
        searchInput.focus();
        announce('Search field focused. Please speak your search term.');
      }
    } else if (command.includes('help')) {
      speak('Available commands: Say "home" to go home, "search" to focus search, "read page" to read content, "stop" to stop reading.');
    } else if (command.includes('read page') || command.includes('read content')) {
      readPageContent();
    } else if (command.includes('stop')) {
      stopSpeaking();
    } else if (command.includes('next')) {
      // Navigate to next focusable element
      const focusable = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const current = document.activeElement;
      const currentIndex = Array.from(focusable).indexOf(current as Element);
      if (currentIndex < focusable.length - 1) {
        (focusable[currentIndex + 1] as HTMLElement).focus();
        readFocusedElement();
      }
    } else if (command.includes('previous') || command.includes('back')) {
      // Navigate to previous focusable element
      const focusable = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const current = document.activeElement;
      const currentIndex = Array.from(focusable).indexOf(current as Element);
      if (currentIndex > 0) {
        (focusable[currentIndex - 1] as HTMLElement).focus();
        readFocusedElement();
      }
    } else if (command.includes('click') || command.includes('select') || command.includes('activate')) {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement) {
        focused.click();
        announce('Activated');
      }
    } else {
      announce('Command not recognized. Say "help" for available commands.');
    }
  }, [announce, stopSpeaking, readFocusedElement, speak]);

  // Read page content
  const readPageContent = useCallback(() => {
    const main = document.querySelector('main') || document.body;
    const headings = main.querySelectorAll('h1, h2, h3');
    const paragraphs = main.querySelectorAll('p');
    
    let content = '';
    
    headings.forEach(h => {
      if (h.textContent) {
        content += h.textContent + '. ';
      }
    });
    
    paragraphs.forEach(p => {
      if (p.textContent && p.textContent.length > 20) {
        content += p.textContent + '. ';
      }
    });

    if (content) {
      speak(`Reading page content. ${content}`);
    } else {
      speak('No readable content found on this page.');
    }
  }, [speak]);

  // Start/stop voice recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeVoiceRecognition();
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      announce('Voice commands stopped');
    } else {
      recognitionRef.current.start();
      setListening(true);
      announce('Listening for voice commands. Say "help" for available commands.');
    }
  }, [listening, initializeVoiceRecognition, announce]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!settings.keyboardShortcuts) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + V: Toggle voice guidance
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        const newEnabled = !settings.enabled;
        setSettings(prev => ({ ...prev, enabled: newEnabled }));
        announce(newEnabled ? 'Voice guidance enabled' : 'Voice guidance disabled', true);
      }
      // Alt + R: Read current page
      else if (e.altKey && e.key === 'r') {
        e.preventDefault();
        readPageContent();
      }
      // Alt + S: Stop speaking
      else if (e.altKey && e.key === 's') {
        e.preventDefault();
        stopSpeaking();
      }
      // Alt + L: Toggle voice commands
      else if (e.altKey && e.key === 'l') {
        e.preventDefault();
        toggleListening();
      }
      // Alt + H: Help
      else if (e.altKey && e.key === 'h') {
        e.preventDefault();
        speak('Keyboard shortcuts: Alt+V to toggle voice, Alt+R to read page, Alt+S to stop reading, Alt+L for voice commands, Alt+H for help.');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [settings, readPageContent, stopSpeaking, toggleListening, speak, announce]);

  // Auto-read navigation on focus
  useEffect(() => {
    if (!settings.autoReadNavigation || !settings.enabled) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, input, select, textarea, [role="button"], [role="link"]')) {
        readFocusedElement();
      }
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [settings, readFocusedElement]);

  return {
    settings,
    setSettings,
    voices,
    speaking,
    listening,
    speak,
    stopSpeaking,
    announce,
    readFocusedElement,
    readPageContent,
    toggleListening,
  };
}