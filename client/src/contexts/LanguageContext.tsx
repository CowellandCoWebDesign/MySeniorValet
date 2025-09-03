import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getTranslation, type Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  translateContent: (content: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    
    // Update HTML dir attribute for RTL languages if needed in future
    document.documentElement.dir = 'ltr';
    
    // Broadcast language change to all components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: language }));
  }, [language]);

  // Basic translation function using the comprehensive translation system
  const t = (key: string, replacements?: Record<string, string>): string => {
    return getTranslation(language, key, replacements);
  };

  // Advanced content translation for dynamic content (database content, user-generated content)
  const translateContent = async (content: string): Promise<string> => {
    // If content is already in the target language or language is English, return as-is
    if (!content || language === 'en') {
      return content;
    }

    // Check if we have a cached translation
    const cacheKey = `translation_${language}_${content.substring(0, 50)}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Use Google Translate API for dynamic content
      // Note: In production, this should call your backend API which then calls Google Translate
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          targetLanguage: language,
          sourceLanguage: 'en'
        })
      });

      if (response.ok) {
        const { translatedText } = await response.json();
        // Cache the translation for this session
        sessionStorage.setItem(cacheKey, translatedText);
        return translatedText;
      }
    } catch (error) {
      console.warn('Translation API failed, returning original content:', error);
    }

    // Fallback to original content if translation fails
    return content;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateContent }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for components that need to translate dynamic content
export function useTranslateContent() {
  const { translateContent } = useLanguage();
  const [translating, setTranslating] = useState(false);

  const translate = async (content: string): Promise<string> => {
    setTranslating(true);
    try {
      const result = await translateContent(content);
      return result;
    } finally {
      setTranslating(false);
    }
  };

  return { translate, translating };
}

// Hook for translating arrays of content
export function useTranslateArray() {
  const { language, translateContent } = useLanguage();
  const [translating, setTranslating] = useState(false);

  const translateArray = async (items: string[]): Promise<string[]> => {
    if (language === 'en' || !items.length) {
      return items;
    }

    setTranslating(true);
    try {
      const translations = await Promise.all(
        items.map(item => translateContent(item))
      );
      return translations;
    } finally {
      setTranslating(false);
    }
  };

  return { translateArray, translating };
}

// Hook that automatically translates when language changes
export function useAutoTranslate(content: string, enabled = true) {
  const { language, translateContent } = useLanguage();
  const [translated, setTranslated] = useState(content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !content || language === 'en') {
      setTranslated(content);
      return;
    }

    let cancelled = false;
    setLoading(true);

    translateContent(content).then(result => {
      if (!cancelled) {
        setTranslated(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [content, language, enabled, translateContent]);

  return { translated, loading };
}