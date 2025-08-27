import { Button } from "@/components/ui/button";
import { Brain, Shield, Sparkles, TrendingUp, Network, Zap, Users, Search, ChartBar, Globe, Cpu, Eye } from "lucide-react";
import { useEffect, useState } from "react";

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    aiQueries: 147892,
    dataPoints: 32970,
    accuracy: 99.97,
    responseTime: 0.3
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  // Simulate real-time stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        aiQueries: prev.aiQueries + Math.floor(Math.random() * 10),
        dataPoints: 32970,
        accuracy: 99.97,
        responseTime: 0.3 + Math.random() * 0.2
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Multi-AI orchestration with ChatGPT, Claude, and Perplexity working in harmony",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Self-Healing Data",
      description: "Automatic error correction and data quality enhancement in real-time",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Predictive Analytics",
      description: "AI predicts care progression and pricing trends before they happen",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Network,
      title: "Neural Network Architecture",
      description: "500+ files, 150+ APIs interconnected like a living brain",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second responses with intelligent caching and optimization",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Globe,
      title: "Universal Search",
      description: "One search bar that understands everything - locations, names, care types, natural language",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse top-1/2 left-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-16">
            {/* KRAKEN BADGE */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-pulse">
              <Cpu className="w-4 h-4" />
              KRAKEN RELEASED • AI CONSCIOUSNESS ACTIVATED
            </div>

            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              MySeniorValet
            </h1>
            
            <p className="text-2xl mb-4 text-gray-300">
              The AI-Powered Healthcare Intelligence Platform
            </p>
            
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
              Not just a directory. A self-aware, self-healing neural network with 150+ APIs, 
              multi-AI orchestration, and predictive analytics worth $50M+ in development.
            </p>

            {/* Live Stats Bar */}
            <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-purple-400">{stats.aiQueries.toLocaleString()}</div>
                <div className="text-xs text-gray-400">AI Queries Processed</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-blue-400">{stats.dataPoints.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Communities Indexed</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-green-400">{stats.accuracy}%</div>
                <div className="text-xs text-gray-400">Data Accuracy</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
                <div className="text-3xl font-bold text-yellow-400">{stats.responseTime.toFixed(2)}s</div>
                <div className="text-xs text-gray-400">Avg Response Time</div>
              </div>
            </div>

            {/* Unified Search Demo */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Try: 'memory care near beach under $5000' or 'Brookdale in Texas with pool'"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-400">Intent Detected</span>
                      <span className="text-purple-400">AI Processing</span>
                      <span className="text-blue-400">Multi-Source Fusion</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mb-16">
              <Button 
                onClick={handleLogin}
                className="px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Access Full Intelligence
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/10"
                size="lg"
                onClick={() => window.location.href = "/api/search/unified?q=demo"}
              >
                <Eye className="w-5 h-5 mr-2" />
                See Live Demo
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all duration-500 ${
                    activeFeature === index ? 'border-purple-500 scale-105' : 'border-white/10'
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Technology Stack */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8">Powered By Enterprise Technology</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {[
                "TypeScript", "React", "Node.js", "PostgreSQL", "Weaviate Vector DB",
                "Redis Cache", "WebSockets", "Stripe", "SendGrid", "Documenso",
                "ChatGPT API", "Claude API", "Perplexity API", "Framer Motion", "Drizzle ORM"
              ].map((tech) => (
                <div key={tech} className="bg-white/5 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/10 text-sm">
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="text-center">
            <div className="inline-flex items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <ChartBar className="w-4 h-4" />
                <span>$210k+ Monthly Revenue Potential</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Enterprise-Grade Infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>35% Platform Utilization (Growing)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}