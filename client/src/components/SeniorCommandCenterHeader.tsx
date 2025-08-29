import { FC } from 'react';
import hologramDisplay from '@assets/generated_images/Hologram_display_ON_f330aba6.png';
import { Activity, Brain, ChartBar, Shield } from 'lucide-react';

interface SeniorCommandCenterHeaderProps {
  className?: string;
}

export const SeniorCommandCenterHeader: FC<SeniorCommandCenterHeaderProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900 via-purple-900 to-indigo-900 ${className}`}>
      {/* Holographic Display Background */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={hologramDisplay} 
          alt="Holographic command center interface"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
      
      {/* Header Content */}
      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={hologramDisplay} 
                alt="Senior Living Command Center"
                className="w-20 h-20 object-contain rounded-lg shadow-2xl"
              />
              {/* Holographic Glow Effect */}
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
                Senior Living Command Center
              </h1>
              <p className="text-cyan-100 text-lg">
                AI-Powered Intelligence Hub • Real-Time Analytics • Future-Ready Platform
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex space-x-2">
            <div className="flex items-center space-x-1 bg-green-500/20 px-3 py-1 rounded-full">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-green-300 text-sm font-medium">ONLINE</span>
            </div>
            <div className="flex items-center space-x-1 bg-cyan-500/20 px-3 py-1 rounded-full">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">AI ACTIVE</span>
            </div>
          </div>
        </div>
        
        {/* Holographic Data Stream Animation */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <div className="text-cyan-400 text-xs mb-1">Communities</div>
            <div className="text-2xl font-bold text-cyan-300">32,970</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="text-purple-400 text-xs mb-1">AI Queries</div>
            <div className="text-2xl font-bold text-purple-300">1.2M+</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 text-xs mb-1">Data Points</div>
            <div className="text-2xl font-bold text-blue-300">5.7M</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="text-green-400 text-xs mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-green-300">99.7%</div>
          </div>
        </div>
      </div>
      
      {/* Scanning Line Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-slide" />
    </div>
  );
};