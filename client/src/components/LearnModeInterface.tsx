import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, BookOpen, MessageCircle, ChevronRight, Star, Clock, User } from 'lucide-react';
import { EnhancedCommunityCard } from '@/components/EnhancedCommunityCard';

interface LearnModeProps {
  searchQuery: string;
  searchResults: any;
  onCommunitySelect?: (community: any) => void;
}

interface QAResponse {
  question: string;
  answer: string;
  sources: Array<{
    type: string;
    title: string;
    relevance: number;
  }>;
  confidence: number;
}

export default function LearnModeInterface({ searchQuery, searchResults, onCommunitySelect }: LearnModeProps) {
  const [qaResponse, setQaResponse] = useState<QAResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState<QAResponse[]>([]);

  // Process Learn mode data from search results
  useEffect(() => {
    if (searchResults?.metadata?.researchResponse) {
      setQaResponse(searchResults.metadata.researchResponse);
      if (searchResults.metadata.researchResponse.question) {
        setConversationHistory(prev => [...prev, searchResults.metadata.researchResponse]);
      }
    }
  }, [searchResults]);

  const handleQuestionSubmit = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setCurrentQuestion(question);

    try {
      const response = await fetch('/api/nlp/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          includeRecommendations: true,
          context: searchQuery // Use original search as context
        })
      });

      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      setQaResponse(data);
      setConversationHistory(prev => [...prev, data]);
    } catch (error) {
      console.error('Learn mode error:', error);
      setQaResponse({
        question,
        answer: "I'm having trouble processing your question right now. Please try again or rephrase your question.",
        sources: [],
        confidence: 0.1
      });
    } finally {
      setIsLoading(false);
      setCurrentQuestion('');
    }
  };

  const suggestedQuestions = [
    "What is memory care and who needs it?",
    "How much does assisted living typically cost?",
    "What's the difference between assisted living and nursing homes?",
    "What should I look for when touring a senior community?",
    "How do I know if my parent needs care?",
    "What insurance covers senior living costs?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Learn Mode Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Learn Mode
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get expert answers about senior living, care options, costs, and everything you need to know to make informed decisions.
        </p>
      </motion.div>

      {/* Question Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ask Your Question
          </h3>
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuestionSubmit(currentQuestion)}
            placeholder="What would you like to know about senior living?"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={() => handleQuestionSubmit(currentQuestion)}
            disabled={isLoading || !currentQuestion.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            Ask
          </button>
        </div>
      </motion.div>

      {/* Suggested Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Popular Questions
          </h3>
        </div>
        
        <div className="grid gap-2 md:grid-cols-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuestionSubmit(question)}
              disabled={isLoading}
              className="text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {question}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Current Answer */}
      <AnimatePresence>
        {qaResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {qaResponse.question}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>Confidence: {Math.round(qaResponse.confidence * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {qaResponse.answer}
              </p>
            </div>

            {/* Sources */}
            {qaResponse.sources && qaResponse.sources.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Sources
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {qaResponse.sources.slice(0, 4).map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                        <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {source.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {source.type} • Relevance: {Math.round(source.relevance * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Communities */}
      {searchResults?.results && searchResults.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Related Communities
          </h3>
          <div className="grid gap-4 md:grid-cols-1">
            {searchResults.results.slice(0, 4).map((community: any, index: number) => {
              // Determine if this is a featured brand community
              const isFeatured = community.featuredBrand === true || 
                                community.parentCompany?.toLowerCase().includes('oakmont') ||
                                community.name?.toLowerCase().includes('oakmont');
              
              return (
                <EnhancedCommunityCard
                  key={community.id || index}
                  community={community}
                  index={index}
                  variant={isFeatured ? 'featured' : 'default'}
                  showActions={false}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-900 dark:text-white font-medium">
                  Analyzing your question...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}