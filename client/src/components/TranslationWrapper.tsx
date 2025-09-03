import { ReactNode, useEffect, useState } from 'react';
import { useLanguage, useAutoTranslate } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface TranslationWrapperProps {
  children: ReactNode;
  translateContent?: boolean;
  className?: string;
  showLoadingSpinner?: boolean;
}

// Component that automatically translates all text content within it
export function TranslationWrapper({
  children,
  translateContent = true,
  className = '',
  showLoadingSpinner = false
}: TranslationWrapperProps) {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  // Force re-render when language changes
  useEffect(() => {
    if (translateContent && language !== 'en') {
      setIsTranslating(true);
      // Small delay to show loading state
      setTimeout(() => setIsTranslating(false), 100);
    }
  }, [language, translateContent]);

  if (isTranslating && showLoadingSpinner) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

// Component for translating a single text string
interface TranslateTextProps {
  text: string;
  fallback?: string;
  className?: string;
}

export function TranslateText({ text, fallback, className = '' }: TranslateTextProps) {
  const { translated, loading } = useAutoTranslate(text);
  
  if (loading) {
    return <span className={`inline-block ${className}`}>{fallback || text}</span>;
  }
  
  return <span className={className}>{translated}</span>;
}

// Component for translating dynamic lists
interface TranslateListProps {
  items: string[];
  renderItem: (item: string, index: number) => ReactNode;
  className?: string;
}

export function TranslateList({ items, renderItem, className = '' }: TranslateListProps) {
  const { language } = useLanguage();
  const [translatedItems, setTranslatedItems] = useState(items);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedItems(items);
      return;
    }

    setLoading(true);
    
    // Batch translate for efficiency
    fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: items,
        targetLanguage: language
      })
    })
      .then(res => res.json())
      .then(data => {
        setTranslatedItems(data.translations || items);
      })
      .catch(() => {
        setTranslatedItems(items); // Fallback to original
      })
      .finally(() => {
        setLoading(false);
      });
  }, [items, language]);

  if (loading) {
    return (
      <div className={className}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  return (
    <div className={className}>
      {translatedItems.map((item, index) => renderItem(item, index))}
    </div>
  );
}

// Hook for components that need translation state
export function useTranslationState() {
  const { language } = useLanguage();
  const [translationKey, setTranslationKey] = useState(0);

  useEffect(() => {
    // Force re-render of components when language changes
    setTranslationKey(prev => prev + 1);
  }, [language]);

  return { language, translationKey };
}