import { Router, Request, Response } from 'express';

const router = Router();

// Translation cache to reduce API calls
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of translationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      translationCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

// Mock translation function (in production, use Google Translate API)
function mockTranslate(text: string, targetLang: string): string {
  // For demo purposes, add language prefix
  const prefixes: Record<string, string> = {
    fr: '[FR] ',
    es: '[ES] '
  };
  
  // Simple mock translations for common phrases
  const commonTranslations: Record<string, Record<string, string>> = {
    fr: {
      'Contact for pricing': 'Contactez pour les prix',
      'View Details': 'Voir les détails',
      'Schedule Tour': 'Planifier une visite',
      'Available': 'Disponible',
      'Occupied': 'Occupé',
      'Memory Care': 'Soins de la mémoire',
      'Assisted Living': 'Résidence assistée',
      'Independent Living': 'Vie autonome'
    },
    es: {
      'Contact for pricing': 'Contactar para precios',
      'View Details': 'Ver detalles',
      'Schedule Tour': 'Programar visita',
      'Available': 'Disponible',
      'Occupied': 'Ocupado',
      'Memory Care': 'Cuidado de la memoria',
      'Assisted Living': 'Vida asistida',
      'Independent Living': 'Vida independiente'
    }
  };
  
  // Check if we have a specific translation
  if (commonTranslations[targetLang]?.[text]) {
    return commonTranslations[targetLang][text];
  }
  
  // Otherwise return with language prefix (mock behavior)
  return prefixes[targetLang] ? prefixes[targetLang] + text : text;
}

// Translate endpoint
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Return original if target is same as source
    if (targetLanguage === sourceLanguage || targetLanguage === 'en') {
      return res.json({ translatedText: text });
    }
    
    // Check cache
    const cacheKey = `${targetLanguage}_${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({ translatedText: cached.text });
    }
    
    // In production, call Google Translate API here
    // For now, use mock translation
    const translatedText = mockTranslate(text, targetLanguage);
    
    // Cache the result
    translationCache.set(cacheKey, {
      text: translatedText,
      timestamp: Date.now()
    });
    
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Batch translate endpoint for efficiency
router.post('/translate/batch', async (req: Request, res: Response) => {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = req.body;
    
    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Limit batch size
    if (texts.length > 100) {
      return res.status(400).json({ error: 'Batch size exceeds limit (100)' });
    }
    
    const translations = await Promise.all(
      texts.map(async (text) => {
        if (targetLanguage === sourceLanguage || targetLanguage === 'en') {
          return text;
        }
        
        const cacheKey = `${targetLanguage}_${text}`;
        const cached = translationCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.text;
        }
        
        const translatedText = mockTranslate(text, targetLanguage);
        translationCache.set(cacheKey, {
          text: translatedText,
          timestamp: Date.now()
        });
        
        return translatedText;
      })
    );
    
    res.json({ translations });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed' });
  }
});

// Get available languages
router.get('/languages', (req: Request, res: Response) => {
  res.json({
    languages: [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'fr', name: 'French', native: 'Français' },
      { code: 'es', name: 'Spanish', native: 'Español' }
    ],
    default: 'en'
  });
});

export default router;