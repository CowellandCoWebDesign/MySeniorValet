import { Button } from "@/components/ui/button";
import { Languages, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LanguageSwitcherProps {
  variant?: 'default' | 'dropdown' | 'simple';
  showLabel?: boolean;
  className?: string;
}

const languages = [
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸',
    regions: ['USA', 'Canada (EN)'],
    coverage: '42,407 communities'
  },
  { 
    code: 'fr', 
    name: 'Français', 
    flag: '🇨🇦',
    regions: ['Québec', 'Canada (FR)'],
    coverage: '7,875 communautés'
  },
  { 
    code: 'es', 
    name: 'Español', 
    flag: '🇲🇽',
    regions: ['México', 'Latin America'],
    coverage: '453 comunidades'
  }
];

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  showLabel = true,
  className = "" 
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language) || languages[0];
  const getNextLang = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  };
  const nextLang = getNextLang();

  if (variant === 'simple') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(nextLang.code as 'en' | 'fr' | 'es')}
        className={`flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      >
        <Languages className="h-4 w-4" />
        {nextLang.code.toUpperCase()}
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="default"
            className={`flex items-center gap-2 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}
          >
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {showLabel && (
              <>
                <span className="font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t('nav.language')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as 'en' | 'fr' | 'es')}
              className={`cursor-pointer ${language === lang.code ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {lang.regions.join(' • ')}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {lang.coverage}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="font-semibold mb-1">Multilingual Support:</div>
              <div>• 🇺🇸 34,532 USA communities</div>
              <div>• 🇨🇦 7,705 Canadian communities</div>
              <div>• 🇲🇽 313 Mexican communities</div>
              <div>• 100% Quebec bilingual</div>
              <div>• Instant translation available</div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default toggle button
  return (
    <Button
      variant="outline"
      size="default"
      onClick={() => setLanguage(nextLang.code as 'en' | 'fr' | 'es')}
      className={`flex items-center gap-2 px-4 py-2 border-2 border-blue-200 dark:border-blue-800 
        bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20
        hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30
        transition-all duration-200 ${className}`}
    >
      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
        <span className="text-gray-400">→</span>
        <span className="font-medium text-sm opacity-70">{nextLang.flag} {nextLang.code.toUpperCase()}</span>
      </div>
    </Button>
  );
}