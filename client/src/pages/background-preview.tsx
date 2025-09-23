import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import option1 from '@assets/generated_images/Purple_blue_nebula_8526e54e.png';
import option2 from '@assets/generated_images/Golden_spiral_galaxy_71dfef9b.png';
import option3 from '@assets/generated_images/Milky_Way_starfield_679ddd1a.png';
import option4 from '@assets/generated_images/Cosmic_aurora_ribbons_02e37f14.png';
import option5 from '@assets/generated_images/Earth_sunrise_space_0eae1811.png';

export default function BackgroundPreview() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const { toast } = useToast();

  const backgroundOptions = [
    {
      id: 1,
      name: 'Purple Blue Nebula',
      description: 'Vibrant purple and blue cosmic clouds with twinkling stars',
      image: option1,
      importPath: '@assets/generated_images/Purple_blue_nebula_8526e54e.png'
    },
    {
      id: 2,
      name: 'Golden Spiral Galaxy',
      description: 'Magnificent galaxy with golden and indigo hues',
      image: option2,
      importPath: '@assets/generated_images/Golden_spiral_galaxy_71dfef9b.png'
    },
    {
      id: 3,
      name: 'Milky Way Starfield',
      description: 'Serene starfield with the Milky Way stretching across',
      image: option3,
      importPath: '@assets/generated_images/Milky_Way_starfield_679ddd1a.png'
    },
    {
      id: 4,
      name: 'Cosmic Aurora',
      description: 'Flowing ribbons of green, purple, and blue cosmic light',
      image: option4,
      importPath: '@assets/generated_images/Cosmic_aurora_ribbons_02e37f14.png'
    },
    {
      id: 5,
      name: 'Earth Sunrise',
      description: 'Stunning view of Earth from space with sunrise',
      image: option5,
      importPath: '@assets/generated_images/Earth_sunrise_space_0eae1811.png'
    }
  ];

  const currentBackground = 'https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg';

  const copyImportPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    toast({
      title: "Import path copied!",
      description: "You can now use this in your code",
    });
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold mb-4">Choose Your Hero Background</h1>
          <p className="text-gray-300 text-lg">
            Select from these 5 generated cosmic backgrounds for your Services Directory hero section
          </p>
        </motion.div>

        {/* Current Background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="overflow-hidden bg-gray-800 border-gray-700">
            <div className="relative h-64">
              <img 
                src={currentBackground}
                alt="Current background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80"></div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  CURRENT
                </span>
                <h3 className="text-2xl font-bold mt-2">Current Background</h3>
                <p className="text-gray-300">The existing cosmic background from Pixabay</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* New Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {backgroundOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card 
                className={`overflow-hidden cursor-pointer transition-all duration-300 ${
                  selectedOption === option.id 
                    ? 'ring-2 ring-purple-500 bg-gray-800 border-purple-500' 
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="relative h-48">
                  <img 
                    src={option.image}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80"></div>
                  {selectedOption === option.id && (
                    <div className="absolute top-4 right-4 bg-purple-500 rounded-full p-2">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{option.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{option.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyImportPath(option.importPath);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copiedPath === option.importPath ? 'Copied!' : 'Copy Import Path'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4">How to Use Your Selected Background</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-purple-500 font-bold mr-3">1.</span>
              <span>Click on your preferred background option above to select it</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 font-bold mr-3">2.</span>
              <span>Click "Copy Import Path" to get the import statement</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 font-bold mr-3">3.</span>
              <span>Replace the background URL in senior-marketplace.tsx with your chosen image import</span>
            </li>
          </ol>
          {selectedOption && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Selected Background:</p>
              <p className="text-lg font-semibold text-purple-400">
                {backgroundOptions.find(o => o.id === selectedOption)?.name}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}