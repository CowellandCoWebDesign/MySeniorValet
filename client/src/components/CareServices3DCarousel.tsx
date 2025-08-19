import React, { useState, TouchEvent, MouseEvent } from 'react';
import { Link } from 'wouter';
import { 
  Activity,
  Heart, 
  Home, 
  Sun, 
  Users, 
  HeartHandshake, 
  Stethoscope, 
  Moon,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shield,
  Clock,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CareServices3DCarousel = () => {
  const [selectedService, setSelectedService] = useState(3); // Start with Adult Day Care in center
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const careServices = [
    {
      id: 'therapy-services',
      name: 'Therapy Services',
      icon: Activity,
      color: 'bg-gradient-to-br from-purple-600 to-purple-800',
      avgCost: '$75-$150/session',
      details: 'Physical, Occupational & Speech therapy',
      federalProgram: 'Medicare Part B',
      coverage: '10M+ beneficiaries',
      keyFeatures: [
        'Physical therapy',
        'Occupational therapy',
        'Speech therapy',
        'Medicare Part B covered'
      ],
      linkPath: '/therapy-services'
    },
    {
      id: 'respite-care',
      name: 'Respite Care',
      icon: Clock,
      color: 'bg-gradient-to-br from-blue-600 to-blue-800',
      avgCost: '$100-$300/day',
      details: 'Temporary relief for family caregivers',
      federalProgram: 'ARCH National Respite',
      coverage: '66M caregivers need respite',
      keyFeatures: [
        'Caregiver relief',
        'Short-term stays',
        'In-home or facility',
        'Medicaid waiver programs'
      ],
      linkPath: '/respite-care'
    },
    {
      id: 'home-care',
      name: 'Home Care',
      icon: Home,
      color: 'bg-gradient-to-br from-green-600 to-green-800',
      avgCost: '$25-$35/hour',
      details: 'Professional care in your home',
      federalProgram: 'Medicare Home Health',
      coverage: '3.4M beneficiaries',
      keyFeatures: [
        'Stay in your home',
        'Flexible scheduling',
        'Medicare covered',
        'VA Aid & Attendance'
      ],
      linkPath: '/home-care-details'
    },
    {
      id: 'adult-day-care',
      name: 'Adult Day Care',
      icon: Sun,
      color: 'bg-gradient-to-br from-yellow-600 to-orange-700',
      avgCost: '$75-$150/day',
      details: 'Daytime care & social activities',
      federalProgram: 'PACE Programs',
      coverage: '260K+ participants',
      keyFeatures: [
        'Social engagement',
        'Respite for families',
        'Meals included',
        'Medicare/Medicaid coverage'
      ],
      linkPath: '/adult-day-care-details'
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      icon: Users,
      color: 'bg-gradient-to-br from-pink-600 to-pink-800',
      avgCost: '$20-$30/hour',
      details: 'ADL assistance & companionship',
      federalProgram: 'Medicaid Personal Care',
      coverage: '2.1M beneficiaries',
      keyFeatures: [
        'Bathing & dressing help',
        'Meal preparation',
        'Light housekeeping',
        'State Medicaid coverage'
      ],
      linkPath: '/personal-care-details'
    },
    {
      id: 'companion-care',
      name: 'Companion Care',
      icon: HeartHandshake,
      color: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      avgCost: '$18-$25/hour',
      details: 'Social support & companionship',
      federalProgram: 'ACL Senior Programs',
      coverage: '43% seniors isolated',
      keyFeatures: [
        'Combat isolation',
        'Social activities',
        'Transportation',
        'Federal grants available'
      ],
      linkPath: '/companion-care-details'
    },
    {
      id: 'nursing-services',
      name: 'Nursing Services',
      icon: Stethoscope,
      color: 'bg-gradient-to-br from-red-600 to-red-800',
      avgCost: '$35-$50/hour',
      details: 'Skilled medical care at home',
      federalProgram: 'Medicare Part A',
      coverage: '100% Medicare covered',
      keyFeatures: [
        'Wound care',
        'IV therapy',
        'Post-surgery care',
        'No copay with Medicare'
      ],
      linkPath: '/nursing-services-details'
    },
    {
      id: 'hospice-care',
      name: 'Hospice Care',
      icon: Moon,
      color: 'bg-gradient-to-br from-teal-600 to-teal-800',
      avgCost: 'Medicare Covered',
      details: 'Comfort & dignity in final journey',
      federalProgram: 'Medicare Hospice Benefit',
      coverage: '1.7M beneficiaries',
      keyFeatures: [
        'Pain management',
        'Family support',
        '24/7 on-call',
        '$0 cost with Medicare'
      ],
      linkPath: '/hospice-care-details'
    }
  ];

  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const diff = currentX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedService > 0) {
        setSelectedService(selectedService - 1);
      } else if (diff < 0 && selectedService < careServices.length - 1) {
        setSelectedService(selectedService + 1);
      }
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const diff = currentX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedService > 0) {
        setSelectedService(selectedService - 1);
      } else if (diff < 0 && selectedService < careServices.length - 1) {
        setSelectedService(selectedService + 1);
      }
    }
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleServiceClick = (index: number) => {
    if (!isDragging) {
      setSelectedService(index);
    }
  };

  return (
    <div className="care-services-3d-section relative overflow-hidden min-h-[800px] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between min-h-[800px] px-4 py-8">
        
        {/* Header */}
        <div className="text-center pt-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 drop-shadow-2xl">
            8 ESSENTIAL CARE SERVICES
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 font-bold drop-shadow-lg mb-4">
            Professional Healthcare Services Backed by Federal Programs
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
              <Shield className="w-4 h-4 mr-1" />
              Government Verified Data
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
              <Info className="w-4 h-4 mr-1" />
              Transparent Citations
            </Badge>
          </div>
        </div>
        
        {/* 3D Carousel */}
        <div className="flex flex-col items-center justify-center px-1 flex-1">
          <div 
            className="carousel-wrapper select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="carousel-3d">
              {careServices.map((service, index) => {
                const Icon = service.icon;
                const offset = (selectedService - index) / 3;
                const absOffset = Math.abs(selectedService - index) / 3;
                const isActive = index === selectedService;
                
                return (
                  <div
                    key={service.id}
                    className="card-container-3d"
                    style={{
                      '--offset': offset,
                      '--abs-offset': absOffset,
                      '--active': isActive ? 1 : 0,
                      pointerEvents: 'auto',
                      opacity: Math.abs(selectedService - index) >= 3 ? 0 : 1,
                      display: Math.abs(selectedService - index) > 3 ? 'none' : 'block',
                    } as React.CSSProperties}
                    onClick={() => handleServiceClick(index)}
                  >
                    <div className={`card-3d ${service.color} rounded-xl flex flex-col items-center justify-between p-4 shadow-2xl border-2 border-white/30`}
                         style={{ 
                           opacity: isActive ? 1 : 0.7,
                           transform: isActive ? 'scale(1.05)' : 'scale(1)',
                           height: '100%'
                         }}>
                      <div className="flex flex-col items-center">
                        <Icon className="w-12 h-12 text-white drop-shadow-lg mb-2" />
                        <h3 className="text-white font-bold text-center text-lg mb-1 drop-shadow-lg">{service.name}</h3>
                        
                        {/* Federal Program Badge */}
                        <div className="bg-white/20 rounded-lg px-2 py-1 mb-2">
                          <p className="text-white text-xs font-bold drop-shadow-md flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {service.federalProgram}
                          </p>
                        </div>
                        
                        {/* Coverage Info */}
                        <div className="bg-green-500/20 rounded-lg px-2 py-1 mb-2">
                          <p className="text-green-200 text-xs font-bold drop-shadow-md">
                            {service.coverage}
                          </p>
                        </div>
                        
                        {/* Average Cost */}
                        <div className="bg-blue-500/20 rounded-lg px-2 py-1 mb-2">
                          <p className="text-blue-200 text-xs font-bold drop-shadow-md flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {service.avgCost}
                          </p>
                        </div>
                        
                        {/* Quick Details */}
                        <p className="text-white/90 text-xs text-center mb-2 drop-shadow-md">
                          {service.details}
                        </p>
                      </div>
                      
                      {/* Key Features - Only show when active */}
                      <div style={{ 
                        opacity: isActive ? 1 : 0,
                        maxHeight: isActive ? '200px' : '0',
                        overflow: 'hidden',
                        transition: 'opacity 0.3s ease-out, max-height 0.3s ease-out'
                      }}>
                        <div className="space-y-1 mb-3">
                          {service.keyFeatures.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-white/80 mt-0.5 flex-shrink-0" />
                              <p className="text-white/90 text-xs leading-tight">{feature}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Learn More Button */}
                        <Link 
                          to={service.linkPath}
                          className="block w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            Explore Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Navigation buttons */}
              {selectedService > 0 && (
                <button 
                  className="nav-3d left"
                  onClick={() => setSelectedService(i => i - 1)}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}
              {selectedService < careServices.length - 1 && (
                <button 
                  className="nav-3d right"
                  onClick={() => setSelectedService(i => i + 1)}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center px-4 pb-4">
          <p className="text-lg md:text-xl text-gray-200 mb-2 drop-shadow-lg">
            <strong>Every care level features comprehensive federal program information</strong>
          </p>
          <p className="text-base text-gray-300 drop-shadow-lg">
            Click any card to discover Medicare coverage, quality standards, and financial assistance programs
          </p>
        </div>
      </div>

      {/* CSS for 3D Carousel */}
      <style jsx>{`
        .carousel-wrapper {
          width: 100%;
          height: 420px;
          position: relative;
          perspective: 1200px;
          user-select: none;
        }
        
        .carousel-3d {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .card-container-3d {
          position: absolute;
          width: 280px;
          height: 380px;
          transform: 
            translateX(calc(var(--offset) * 250px))
            translateZ(calc(var(--abs-offset) * -200px))
            rotateY(calc(var(--offset) * -25deg));
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: calc(10 - var(--abs-offset) * 10);
        }
        
        .card-3d {
          width: 100%;
          height: 100%;
          transition: all 0.3s ease-out;
          cursor: pointer;
        }
        
        .nav-3d {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        .nav-3d:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-50%) scale(1.1);
        }
        
        .nav-3d.left {
          left: 20px;
        }
        
        .nav-3d.right {
          right: 20px;
        }
        
        @media (max-width: 768px) {
          .carousel-wrapper {
            height: 380px;
          }
          
          .card-container-3d {
            width: 240px;
            height: 340px;
            transform: 
              translateX(calc(var(--offset) * 200px))
              translateZ(calc(var(--abs-offset) * -150px))
              rotateY(calc(var(--offset) * -20deg));
          }
        }
      `}</style>
    </div>
  );
};