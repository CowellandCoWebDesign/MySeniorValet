import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';

// Import all light design images
import BeaconLightON from '@assets/generated_images/Beacon_light_ON_a135a115.png';
import BeaconLightOFF from '@assets/generated_images/Beacon_light_OFF_f0e868e0.png';
import LightSplitComparison from '@assets/generated_images/Light_ON_vs_OFF_split_c4067a35.png';
import SimpleLightON from '@assets/generated_images/Simple_light_ON_icon_b7425e87.png';
import SimpleLightOFF from '@assets/generated_images/Simple_light_OFF_icon_8488cd8e.png';
import JapanesePagoda from '@assets/generated_images/Japanese_pagoda_lighthouse_a5e3f687.png';
import DarkPagoda from '@assets/generated_images/Dark_pagoda_lighthouse_1cb46d0d.png';
import PagodaCloseup from '@assets/generated_images/Pagoda_lighthouse_closeup_fc4bfc1d.png';
import LuxuryHotelPagoda from '@assets/generated_images/Luxury_hotel_pagoda_c4b3e629.png';
import PixelPagoda from '@assets/generated_images/Pixel_pagoda_lighthouse_4846fc27.png';
import MinimalPagodaIcon from '@assets/generated_images/Minimal_pagoda_icon_f2083762.png';
import RyokanLighthouse from '@assets/generated_images/Ryokan_lighthouse_inn_309a9ba3.png';
import EdisonBulbON from '@assets/generated_images/Edison_bulb_ON_086ddfc6.png';
import EdisonBulbOFF from '@assets/generated_images/Edison_bulb_OFF_63c7e6ee.png';
import PaperLanternON from '@assets/generated_images/Paper_lantern_ON_0013fe57.png';
import PaperLanternOFF from '@assets/generated_images/Paper_lantern_OFF_2524a578.png';
import CandleFlameON from '@assets/generated_images/Candle_flame_ON_4a2a5eea.png';
import CandleOFF from '@assets/generated_images/Candle_OFF_eb505099.png';
import MarqueeLetterON from '@assets/generated_images/Marquee_letter_ON_69a28e4d.png';
import FireflyLightON from '@assets/generated_images/Firefly_light_ON_d97ed748.png';
import CampfireEmbersON from '@assets/generated_images/Campfire_embers_ON_8db648dc.png';
import MoonPhasesLight from '@assets/generated_images/Moon_phases_light_5ce560c5.png';
import AuroraLights from '@assets/generated_images/Aurora_lights_4df3541c.png';
import NeonSignON from '@assets/generated_images/Neon_sign_ON_a4f9d903.png';
import LEDRingON from '@assets/generated_images/LED_ring_ON_d59037fe.png';
import PowerButtonON from '@assets/generated_images/Power_button_ON_936b0f83.png';
import TrafficLightGreen from '@assets/generated_images/Traffic_light_green_926e9754.png';
import LavaLampON from '@assets/generated_images/Lava_lamp_ON_3f85220b.png';
import CrystalChandelierON from '@assets/generated_images/Crystal_chandelier_ON_8cfc6a67.png';
import StringLightsON from '@assets/generated_images/String_lights_ON_8d3f7a7f.png';
import SaltLampON from '@assets/generated_images/Salt_lamp_ON_833c48c8.png';
import DiscoBallLights from '@assets/generated_images/Disco_ball_lights_8766df18.png';
import SunriseSunsetSplit from '@assets/generated_images/Sunrise_sunset_split_bfdb43e0.png';
import ArcadeButtonON from '@assets/generated_images/Arcade_button_ON_c3ec29e8.png';
import StainedGlassLight from '@assets/generated_images/Stained_glass_light_f55543d9.png';
import VacuumTubeON from '@assets/generated_images/Vacuum_tube_ON_a3b22f3d.png';
import JellyfishGlow from '@assets/generated_images/Jellyfish_glow_92d6dd43.png';
import ProjectorBeamON from '@assets/generated_images/Projector_beam_ON_8052678e.png';
import FiberOpticLight from '@assets/generated_images/Fiber_optic_light_36727f5c.png';
import StageSpotlightON from '@assets/generated_images/Stage_spotlight_ON_aaf94c25.png';
import HologramDisplayON from '@assets/generated_images/Hologram_display_ON_f330aba6.png';
import MatchStrikeON from '@assets/generated_images/Match_strike_ON_45056c27.png';
import LighthouseComparison from '@assets/generated_images/Lighthouse_ON_OFF_comparison_a63d884c.png';
import RadioDialGlow from '@assets/generated_images/Radio_dial_glow_eacddb9c.png';
import LightningStrike from '@assets/generated_images/Lightning_strike_d64167c8.png';
import FireplaceEmbers from '@assets/generated_images/Fireplace_embers_7854232b.png';
import MotelVacancySign from '@assets/generated_images/Motel_vacancy_sign_ae0ac2af.png';
import CrystalGeodeGlow from '@assets/generated_images/Crystal_geode_glow_8cc74b7e.png';
import HollywoodMirrorLights from '@assets/generated_images/Hollywood_mirror_lights_03b77425.png';
import SubwayTrainLights from '@assets/generated_images/Subway_train_lights_dfb4a1ef.png';
import GlowingMushrooms from '@assets/generated_images/Glowing_mushrooms_9481dec9.png';
import SolarEclipse from '@assets/generated_images/Solar_eclipse_9d6c9317.png';

interface LightDesign {
  name: string;
  category: string;
  images: {
    on?: string;
    off?: string;
    combined?: string;
  };
  usage?: string;
  implemented?: boolean;
  description?: string;
}

const lightDesigns: LightDesign[] = [
  // Currently Implemented
  {
    name: 'Motel Vacancy Sign',
    category: 'Implemented',
    images: { on: MotelVacancySign },
    usage: 'Community Directory Header',
    implemented: true,
    description: 'Classic "we\'ll leave the light on" hospitality theme'
  },
  {
    name: 'Match Strike',
    category: 'Implemented',
    images: { on: MatchStrikeON },
    usage: 'Dark Mode Toggle',
    implemented: true,
    description: 'Instant ignition and transformation'
  },
  {
    name: 'Cinema Projector',
    category: 'Implemented',
    images: { on: ProjectorBeamON },
    usage: 'Light Mode Toggle',
    implemented: true,
    description: 'Bright beam illuminating the experience'
  },
  {
    name: 'Holographic Display',
    category: 'Implemented',
    images: { on: HologramDisplayON },
    usage: 'Senior Living Command Center',
    implemented: true,
    description: 'Futuristic data visualization'
  },
  
  // Lighthouse Collection
  {
    name: 'Lighthouse Beacon Comparison',
    category: 'Lighthouse',
    images: { combined: LighthouseComparison },
    description: 'Split view ON/OFF lighthouse beacon'
  },
  {
    name: 'Beacon Light',
    category: 'Lighthouse',
    images: { on: BeaconLightON, off: BeaconLightOFF },
    description: 'Classic lighthouse beacon'
  },
  {
    name: 'Light ON vs OFF Split',
    category: 'Lighthouse',
    images: { combined: LightSplitComparison },
    description: 'Clear comparison view'
  },
  {
    name: 'Simple Light Icons',
    category: 'Lighthouse',
    images: { on: SimpleLightON, off: SimpleLightOFF },
    description: 'Minimalist lighthouse icons'
  },
  
  // Japanese Pagoda Collection
  {
    name: 'Japanese Pagoda Lighthouse',
    category: 'Pagoda',
    images: { on: JapanesePagoda },
    description: 'Eastern hospitality meets Western guidance'
  },
  {
    name: 'Dark Pagoda',
    category: 'Pagoda',
    images: { on: DarkPagoda },
    description: 'Mysterious nighttime pagoda'
  },
  {
    name: 'Pagoda Closeup',
    category: 'Pagoda',
    images: { on: PagodaCloseup },
    description: 'Detailed pagoda beacon'
  },
  {
    name: 'Luxury Hotel Pagoda',
    category: 'Pagoda',
    images: { on: LuxuryHotelPagoda },
    description: 'Premium hospitality aesthetic'
  },
  {
    name: 'Pixel Pagoda',
    category: 'Pagoda',
    images: { on: PixelPagoda },
    description: 'Retro gaming style'
  },
  {
    name: 'Minimal Pagoda Icon',
    category: 'Pagoda',
    images: { on: MinimalPagodaIcon },
    description: 'Clean, modern design'
  },
  {
    name: 'Ryokan Lighthouse Inn',
    category: 'Pagoda',
    images: { on: RyokanLighthouse },
    description: 'Traditional Japanese inn'
  },
  
  // Vintage & Classic
  {
    name: 'Edison Bulb',
    category: 'Vintage',
    images: { on: EdisonBulbON, off: EdisonBulbOFF },
    description: 'Warm vintage filament'
  },
  {
    name: 'Paper Lantern',
    category: 'Vintage',
    images: { on: PaperLanternON, off: PaperLanternOFF },
    description: 'Soft traditional glow'
  },
  {
    name: 'Candle Flame',
    category: 'Vintage',
    images: { on: CandleFlameON, off: CandleOFF },
    description: 'Timeless warmth'
  },
  {
    name: 'Marquee Letter',
    category: 'Vintage',
    images: { on: MarqueeLetterON },
    description: 'Theater showbiz lights'
  },
  {
    name: 'Radio Dial',
    category: 'Vintage',
    images: { on: RadioDialGlow },
    description: 'Nostalgic amber glow'
  },
  {
    name: 'Vacuum Tube',
    category: 'Vintage',
    images: { on: VacuumTubeON },
    description: 'Retro electronics warmth'
  },
  
  // Nature & Celestial
  {
    name: 'Moon Phases',
    category: 'Nature',
    images: { combined: MoonPhasesLight },
    description: 'Natural light/dark cycle'
  },
  {
    name: 'Aurora Borealis',
    category: 'Nature',
    images: { on: AuroraLights },
    description: 'Magical northern lights'
  },
  {
    name: 'Firefly',
    category: 'Nature',
    images: { on: FireflyLightON },
    description: 'Bioluminescent magic'
  },
  {
    name: 'Campfire Embers',
    category: 'Nature',
    images: { on: CampfireEmbersON },
    description: 'Outdoor warmth'
  },
  {
    name: 'Sunrise/Sunset',
    category: 'Nature',
    images: { combined: SunriseSunsetSplit },
    description: 'Day/night transition'
  },
  {
    name: 'Jellyfish',
    category: 'Nature',
    images: { on: JellyfishGlow },
    description: 'Underwater bioluminescence'
  },
  {
    name: 'Lightning Strike',
    category: 'Nature',
    images: { on: LightningStrike },
    description: 'Electric power of nature'
  },
  {
    name: 'Glowing Mushrooms',
    category: 'Nature',
    images: { on: GlowingMushrooms },
    description: 'Enchanted forest magic'
  },
  {
    name: 'Solar Eclipse',
    category: 'Nature',
    images: { on: SolarEclipse },
    description: 'Cosmic celestial event'
  },
  
  // Modern Tech
  {
    name: 'Power Button',
    category: 'Tech',
    images: { on: PowerButtonON },
    description: 'Universal ON/OFF symbol'
  },
  {
    name: 'LED Ring',
    category: 'Tech',
    images: { on: LEDRingON },
    description: 'Modern tech indicator'
  },
  {
    name: 'Neon Sign',
    category: 'Tech',
    images: { on: NeonSignON },
    description: 'Urban electric glow'
  },
  {
    name: 'Fiber Optic',
    category: 'Tech',
    images: { on: FiberOpticLight },
    description: 'Data as light'
  },
  {
    name: 'Traffic Light',
    category: 'Tech',
    images: { on: TrafficLightGreen },
    description: 'Green means go'
  },
  
  // Entertainment
  {
    name: 'Arcade Button',
    category: 'Entertainment',
    images: { on: ArcadeButtonON },
    description: 'Rainbow gaming aesthetic'
  },
  {
    name: 'Stage Spotlight',
    category: 'Entertainment',
    images: { on: StageSpotlightON },
    description: 'Theater drama'
  },
  {
    name: 'Disco Ball',
    category: 'Entertainment',
    images: { on: DiscoBallLights },
    description: 'Party celebration'
  },
  {
    name: 'Hollywood Mirror',
    category: 'Entertainment',
    images: { on: HollywoodMirrorLights },
    description: 'Glamorous vanity'
  },
  
  // Decorative & Ambient
  {
    name: 'Lava Lamp',
    category: 'Decorative',
    images: { on: LavaLampON },
    description: '70s psychedelic'
  },
  {
    name: 'Crystal Chandelier',
    category: 'Decorative',
    images: { on: CrystalChandelierON },
    description: 'Elegant luxury'
  },
  {
    name: 'String Lights',
    category: 'Decorative',
    images: { on: StringLightsON },
    description: 'Warm fairy lights'
  },
  {
    name: 'Salt Lamp',
    category: 'Decorative',
    images: { on: SaltLampON },
    description: 'Wellness glow'
  },
  {
    name: 'Stained Glass',
    category: 'Decorative',
    images: { on: StainedGlassLight },
    description: 'Colorful cathedral light'
  },
  {
    name: 'Fireplace Embers',
    category: 'Decorative',
    images: { on: FireplaceEmbers },
    description: 'Cozy home hearth'
  },
  {
    name: 'Crystal Geode',
    category: 'Decorative',
    images: { on: CrystalGeodeGlow },
    description: 'Mystical mineral light'
  },
  {
    name: 'Subway Train',
    category: 'Decorative',
    images: { on: SubwayTrainLights },
    description: 'Urban transit approach'
  }
];

export default function LightDesignGallery() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Implemented', ...Array.from(new Set(lightDesigns.map(d => d.category).filter(c => c !== 'Implemented')))];
  
  const filteredDesigns = selectedCategory === 'All' 
    ? lightDesigns 
    : lightDesigns.filter(d => d.category === selectedCategory);

  const copyPath = (path: string, name: string) => {
    navigator.clipboard.writeText(path);
    setCopiedItem(name);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Light Design Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete collection of theme toggle light designs for MySeniorValet platform
            </p>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{lightDesigns.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Designs</div>
                </CardContent>
              </Card>
              <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Implemented</div>
                </CardContent>
              </Card>
              <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{categories.length - 2}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Categories</div>
                </CardContent>
              </Card>
              <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{lightDesigns.length - 4}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Available</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 h-auto p-2 bg-white dark:bg-gray-800">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className={cat === 'Implemented' ? 'bg-green-100 dark:bg-green-900' : ''}
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => (
            <Card 
              key={design.name} 
              className={`overflow-hidden hover:shadow-xl transition-shadow ${
                design.implemented ? 'border-green-500 border-2' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{design.name}</span>
                  {design.implemented && (
                    <Badge className="bg-green-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </CardTitle>
                {design.usage && (
                  <Badge variant="outline" className="mt-2">
                    {design.usage}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Image Display */}
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-2">
                    {design.images.combined ? (
                      <img 
                        src={design.images.combined} 
                        alt={design.name}
                        className="w-full h-40 object-contain rounded"
                      />
                    ) : (
                      <div className="flex gap-2">
                        {design.images.on && (
                          <img 
                            src={design.images.on} 
                            alt={`${design.name} ON`}
                            className="w-1/2 h-40 object-contain rounded"
                          />
                        )}
                        {design.images.off && (
                          <img 
                            src={design.images.off} 
                            alt={`${design.name} OFF`}
                            className="w-1/2 h-40 object-contain rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  {design.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {design.description}
                    </p>
                  )}
                  
                  {/* Category Badge */}
                  <Badge variant="secondary">{design.category}</Badge>
                  
                  {/* Copy Path Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {design.images.on && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPath(design.images.on!, `${design.name} ON`)}
                      >
                        {copiedItem === `${design.name} ON` ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        ON Path
                      </Button>
                    )}
                    {design.images.off && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPath(design.images.off!, `${design.name} OFF`)}
                      >
                        {copiedItem === `${design.name} OFF` ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        OFF Path
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}