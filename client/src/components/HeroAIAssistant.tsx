import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroAIAssistantProps {
  onSearch?: (query: string) => void;
}

export function HeroAIAssistant({ onSearch }: HeroAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = [
    "Find HUD housing near me",
    "What's the difference between assisted living and memory care?",
    "Communities under $3000/month in Florida",
    "VA benefits for senior housing",
    "55+ communities with pools"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Navigate to AI search with the query
    window.location.href = `/ai-search-intelligence?q=${encodeURIComponent(message)}`;
  };

  const handleQuickPrompt = (prompt: string) => {
    window.location.href = `/ai-search-intelligence?q=${encodeURIComponent(prompt)}`;
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </motion.div>

      {/* Inline AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 relative"
          >
            <Card className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-lg border-purple-400/30 shadow-2xl">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                    <h3 className="text-lg font-semibold text-white">AI Senior Living Assistant</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Prompts */}
                <div className="mb-3">
                  <p className="text-xs text-white/60 mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about senior living..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || isThinking}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="mt-3 flex items-center gap-2 text-white/70">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs">AI is thinking...</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}