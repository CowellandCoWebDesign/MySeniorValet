import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  MessageCircle, 
  Search, 
  User, 
  Send, 
  Sparkles,
  HelpCircle,
  BookOpen,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Heart,
  Star,
  Settings,
  LogIn,
  UserPlus,
  Map,
  Calendar,
  CreditCard,
  Building,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

export default function AISupport() {
  const [activeTab, setActiveTab] = useState('ai-chat');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: "Hi! I'm MySeniorValet's AI assistant. I can help you find communities, understand pricing, navigate the platform, or answer questions about senior living. What would you like to know?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { icon: <Search className="w-4 h-4" />, text: "How to search communities", action: "search-help" },
    { icon: <DollarSign className="w-4 h-4" />, text: "Understanding pricing", action: "pricing-help" },
    { icon: <LogIn className="w-4 h-4" />, text: "Login issues", action: "login-help" },
    { icon: <Heart className="w-4 h-4" />, text: "Using favorites", action: "favorites-help" },
    { icon: <Map className="w-4 h-4" />, text: "Map navigation", action: "map-help" },
    { icon: <Building className="w-4 h-4" />, text: "Community claiming", action: "claim-help" }
  ];

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <UserPlus className="w-5 h-5" />,
      description: 'New to MySeniorValet? Start here',
      articles: [
        'Creating your first account',
        'Understanding care types',
        'How to search effectively',
        'Setting up your profile'
      ]
    },
    {
      id: 'searching',
      title: 'Search & Discovery',
      icon: <Search className="w-5 h-5" />,
      description: 'Find the perfect community',
      articles: [
        'Advanced search filters',
        'Map view navigation',
        'Understanding availability',
        'Saving favorites'
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Costs',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Understand senior living costs',
      articles: [
        'How pricing works',
        'Affordable housing options',
        'Insurance and Medicare',
        'Payment plans'
      ]
    },
    {
      id: 'family',
      title: 'Family Features',
      icon: <Heart className="w-5 h-5" />,
      description: 'Collaborate with family',
      articles: [
        'Sharing communities',
        'Family collaboration tools',
        'Tour tracking',
        'Notes and communication'
      ]
    },
    {
      id: 'communities',
      title: 'For Communities',
      icon: <Building className="w-5 h-5" />,
      description: 'Community management',
      articles: [
        'Claiming your profile',
        'Updating information',
        'Managing photos',
        'Analytics and insights'
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: <Settings className="w-5 h-5" />,
      description: 'Technical issues and bugs',
      articles: [
        'Browser compatibility',
        'Mobile app issues',
        'Account problems',
        'Report a bug'
      ]
    }
  ];

  const aiResponses = {
    'search-help': "I can help you search more effectively! Try entering a city name like 'San Francisco' or a ZIP code. You can also filter by care type (Independent Living, Assisted Living, Memory Care) and use the map view to explore nearby options. What specific location are you looking for?",
    'pricing-help': "MySeniorValet shows transparent pricing! We display 'Starting at' prices based on market research when communities don't provide live pricing. Our pricing comes from government data, industry reports, and community-provided information. Are you looking for pricing in a specific area?",
    'login-help': "Having trouble logging in? First, make sure you're using the correct email address. If you forgot your password, click 'Forgot Password' on the login page. If you're still having issues, I can help you troubleshoot or connect you with support.",
    'favorites-help': "You can save communities by clicking the heart icon on any community card. Your favorites are stored in your dashboard where you can view them anytime, add notes, and share with family members. Would you like me to walk you through the process?",
    'map-help': "Our map view shows communities with color-coded availability indicators. You can zoom in/out, switch between map and list view, and use filters to narrow results. The map automatically updates as you move around. What would you like to do with the map?",
    'claim-help': "Communities can claim their profiles through our Community Portal. The process involves verifying employment, choosing a management plan, and getting approval. Once claimed, communities can update their information, photos, and availability. Are you representing a community?"
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages([...chatMessages, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'ai',
        message: "I understand you're asking about: " + newMessage + ". Let me help you with that. For more specific assistance, I can connect you with our human support team or guide you to the relevant help articles. What would you prefer?",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    const response = aiResponses[action as keyof typeof aiResponses];
    if (response) {
      const aiMessage = {
        id: chatMessages.length + 1,
        type: 'ai',
        message: response,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...chatMessages, aiMessage]);
    }
  };

  const renderAIChat = () => (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm rounded-lg p-3 ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.message}</p>
              <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about MySeniorValet..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderHelpArticles = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {helpCategories.map((category) => (
        <Card key={category.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {category.icon}
              <span>{category.title}</span>
            </CardTitle>
            <p className="text-sm text-gray-600">{category.description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {category.articles.map((article, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm hover:text-blue-600 cursor-pointer">
                  <ChevronRight className="w-3 h-3" />
                  <span>{article}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContactSupport = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Email Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Get detailed help via email</p>
            <div className="space-y-2">
              <p className="text-sm">📧 General: info@myseniorvalet.com</p>
              <p className="text-sm">🏢 Communities: communities@myseniorvalet.com</p>
              <p className="text-sm">🔧 Technical: support@myseniorvalet.com</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">Response time: 24-48 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span>Phone Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Speak with a real person</p>
            <p className="text-lg font-semibold">1-800-SENIOR-1</p>
            <p className="text-sm text-gray-600">Monday-Friday: 8AM-6PM PST</p>
            <p className="text-sm text-gray-600">Saturday: 9AM-3PM PST</p>
            <p className="text-xs text-gray-500 mt-4">Average wait time: 3-5 minutes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea placeholder="Describe your issue or question..." rows={4} />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="w-12 h-12" />
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AI-Powered Support Center</h1>
            <p className="text-xl text-blue-100">
              Get instant help with AI assistance, comprehensive guides, and human support
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Help</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleQuickAction(action.action)}
              >
                {action.icon}
                <span className="text-xs text-center">{action.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'ai-chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('ai-chat')}
              className="flex-1 flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </Button>
            <Button
              variant={activeTab === 'help-articles' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('help-articles')}
              className="flex-1 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Help Articles</span>
            </Button>
            <Button
              variant={activeTab === 'contact' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('contact')}
              className="flex-1 flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === 'ai-chat' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>AI Assistant</span>
                  <Badge variant="secondary">Powered by AI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderAIChat()}
              </CardContent>
            </Card>
          )}

          {activeTab === 'help-articles' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Browse Help Topics</h3>
              {renderHelpArticles()}
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact Our Support Team</h3>
              {renderContactSupport()}
            </div>
          )}
        </div>

        {/* Status & Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <p className="text-xs text-gray-600">All systems operational</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">&lt; 30s</div>
              <p className="text-xs text-gray-600">AI Response Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-gray-600">Resolution Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <p className="text-xs text-gray-600">AI Availability</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Still need help? Our team is here to support you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Searching Communities
              </Button>
            </Link>
            <Link href="/community-portal">
              <Button variant="outline">
                Community Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}