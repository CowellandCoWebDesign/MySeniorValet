import { FC } from 'react';
import motelVacancySign from '@assets/generated_images/Motel_vacancy_sign_ae0ac2af.png';

interface CommunityDirectoryHeaderProps {
  className?: string;
}

export const CommunityDirectoryHeader: FC<CommunityDirectoryHeaderProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-orange-900 ${className}`}>
      {/* Motel Vacancy Sign - "We'll leave the light on" */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 dark:opacity-30">
        <img 
          src={motelVacancySign} 
          alt="Vacancy sign - We'll leave the light on for you"
          className="w-32 h-32 object-contain animate-pulse"
        />
      </div>
      
      {/* Header Content */}
      <div className="relative z-10 p-8">
        <div className="flex items-center space-x-4">
          <img 
            src={motelVacancySign} 
            alt="Community Directory - Always welcoming"
            className="w-16 h-16 object-contain rounded-lg shadow-2xl animate-pulse"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Community Directory
            </h1>
            <p className="text-red-100 text-lg italic">
              "We'll leave the light on for you" - Find your perfect senior living community
            </p>
          </div>
        </div>
        
        {/* Animated Neon Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-red-500/10 to-transparent animate-pulse pointer-events-none" />
      </div>
    </div>
  );
};