import { useState } from 'react';
import { motion } from 'framer-motion';
import { MascotLoadingDisplay } from '@/components/MascotLoadingDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Rocket, Star } from 'lucide-react';

export default function NostalgicDemo() {
  const [showLoading, setShowLoading] = useState(false);

  const handleShowLoading = () => {
    setShowLoading(true);
    // Auto-hide after 8 seconds to show the effect
    setTimeout(() => setShowLoading(false), 8000);
  };

  if (showLoading) {
    return (
      <MascotLoadingDisplay 
        title="Exploring the Future City of Fallen Great Companies"
        subtitle="Where RadioShack, Blockbuster, and all the retail legends live on in digital memory"
        showProgress={true}
        progressDuration={8}
        factRotationSpeed={2000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Star className="text-yellow-400" />
            Nostalgic Space Scene Demo
            <Sparkles className="text-purple-400" />
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Experience the comprehensive "Future City of Fallen Great Companies" with historically accurate logos 
            floating through space clouds - featuring RadioShack, Blockbuster, Toys"R"Us, and 9+ more retail legends.
          </p>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid gap-8 mb-8">
          <Card className="bg-slate-900/90 border-orange-500/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                Launch Loading Experience
              </CardTitle>
              <CardDescription className="text-gray-300">
                See the complete nostalgic space scene with all fallen retail giants in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleShowLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
              >
                🚀 Launch Nostalgic Loading Screen
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-purple-500/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-purple-400">Featured Fallen Retail Giants</CardTitle>
              <CardDescription className="text-gray-300">
                Historically accurate logos recreated in the space scene
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-200">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-orange-400">📻 RadioShack</span>
                  <p className="text-sm text-gray-400">1974-1995 Circular "R" Logo</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-blue-400">🎬 Blockbuster</span>
                  <p className="text-sm text-gray-400">Blue/Yellow Ticket Design</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-red-400">🦒 Toys"R"Us</span>
                  <p className="text-sm text-gray-400">Geoffrey Giraffe Era</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-yellow-400">🏪 Circuit City</span>
                  <p className="text-sm text-gray-400">Classic Red Tag</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-green-400">🏢 Sears</span>
                  <p className="text-sm text-gray-400">Roebuck & Co.</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <span className="font-semibold text-indigo-400">🛍️ And 7+ More</span>
                  <p className="text-sm text-gray-400">KB Toys, Borders, Tower Records...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-blue-500/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-blue-400">Visual Features</CardTitle>
              <CardDescription className="text-gray-300">
                Enhanced nostalgic experience elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Purple cosmic clouds with "peeking through" effect
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Animated twinkling stars throughout the scene
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Nostalgic orange gradient UI elements
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Floating animated emojis and effects
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Platform-wide integration for all loading screens
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            ← Back to Platform
          </Button>
        </div>
      </div>
    </div>
  );
}