import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Heart, Home, Users, TreePine, Shield, Utensils, Activity, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'slider' | 'location';
  options?: { value: string; label: string; icon?: React.ReactNode }[];
  min?: number;
  max?: number;
  step?: number;
  category: 'care' | 'lifestyle' | 'budget' | 'location' | 'preferences';
}

interface QuizAnswers {
  [key: string]: string | string[] | number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'careLevel',
    question: 'What level of care are you looking for?',
    type: 'single',
    category: 'care',
    options: [
      { value: 'independent', label: 'Independent Living', icon: <Home className="w-5 h-5" /> },
      { value: 'assisted', label: 'Assisted Living', icon: <Users className="w-5 h-5" /> },
      { value: 'memory', label: 'Memory Care', icon: <Shield className="w-5 h-5" /> },
      { value: 'skilled', label: 'Skilled Nursing', icon: <Heart className="w-5 h-5" /> }
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your monthly budget range?',
    type: 'slider',
    category: 'budget',
    min: 2000,
    max: 15000,
    step: 500
  },
  {
    id: 'location',
    question: 'Where would you like to live?',
    type: 'location',
    category: 'location'
  },
  {
    id: 'amenities',
    question: 'Which amenities are most important to you?',
    type: 'multiple',
    category: 'preferences',
    options: [
      { value: 'fitness', label: 'Fitness Center', icon: <Activity className="w-5 h-5" /> },
      { value: 'dining', label: 'Fine Dining', icon: <Utensils className="w-5 h-5" /> },
      { value: 'gardens', label: 'Gardens & Outdoor Space', icon: <TreePine className="w-5 h-5" /> },
      { value: 'transportation', label: 'Transportation', icon: <ArrowRight className="w-5 h-5" /> },
      { value: 'activities', label: 'Social Activities', icon: <Users className="w-5 h-5" /> },
      { value: 'pets', label: 'Pet Friendly', icon: <Heart className="w-5 h-5" /> }
    ]
  },
  {
    id: 'lifestyle',
    question: 'What describes your ideal lifestyle?',
    type: 'single',
    category: 'lifestyle',
    options: [
      { value: 'active', label: 'Active & Social', icon: <Activity className="w-5 h-5" /> },
      { value: 'quiet', label: 'Quiet & Peaceful', icon: <TreePine className="w-5 h-5" /> },
      { value: 'urban', label: 'Urban & Convenient', icon: <Home className="w-5 h-5" /> },
      { value: 'luxury', label: 'Luxury & Premium', icon: <Sparkles className="w-5 h-5" /> }
    ]
  },
  {
    id: 'priorities',
    question: 'What\'s most important in your decision?',
    type: 'multiple',
    category: 'preferences',
    options: [
      { value: 'quality', label: 'Quality of Care', icon: <Shield className="w-5 h-5" /> },
      { value: 'cost', label: 'Affordability', icon: <Heart className="w-5 h-5" /> },
      { value: 'location', label: 'Location', icon: <Home className="w-5 h-5" /> },
      { value: 'reputation', label: 'Reputation & Reviews', icon: <CheckCircle2 className="w-5 h-5" /> },
      { value: 'amenities', label: 'Amenities & Activities', icon: <Activity className="w-5 h-5" /> }
    ]
  }
];

const progressSteps = [
  { label: 'Care Needs', icon: <Heart className="w-4 h-4" />, color: 'text-pink-500' },
  { label: 'Budget', icon: <Home className="w-4 h-4" />, color: 'text-blue-500' },
  { label: 'Location', icon: <TreePine className="w-4 h-4" />, color: 'text-green-500' },
  { label: 'Preferences', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-500' },
  { label: 'Lifestyle', icon: <Activity className="w-4 h-4" />, color: 'text-orange-500' },
  { label: 'Priorities', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' }
];

export default function CommunityMatchingQuiz({ onComplete }: { onComplete: (answers: QuizAnswers) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      setShowResults(true);
      setTimeout(() => {
        onComplete(answers);
      }, 2000);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const currentQuestionData = quizQuestions[currentQuestion];
  const currentAnswer = answers[currentQuestionData?.id];

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8"
      >
        <Card className="text-center">
          <CardContent className="p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Finding Your Perfect Match!
              </h2>
              <p className="text-gray-600 mb-8">
                We're analyzing your preferences to find the best communities for you...
              </p>
              
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Matching Quiz
          </h1>
          <Badge variant="secondary" className="text-sm">
            {currentQuestion + 1} of {quizQuestions.length}
          </Badge>
        </div>
        
        {/* Whimsical Progress Bar */}
        <div className="relative">
          <Progress value={progress} className="h-3 mb-4" />
          <div className="flex justify-between">
            {progressSteps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col items-center ${
                  index <= currentQuestion ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index <= currentQuestion 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {index < currentQuestion ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-xs font-medium ${step.color}`}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestionData?.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionRenderer
                question={currentQuestionData}
                answer={currentAnswer}
                onAnswer={handleAnswer}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={nextQuestion}
          disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {currentQuestion === quizQuestions.length - 1 ? 'Find My Match' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Question Renderer Component
function QuestionRenderer({ 
  question, 
  answer, 
  onAnswer 
}: { 
  question: QuizQuestion; 
  answer: string | string[] | number | undefined; 
  onAnswer: (questionId: string, answer: string | string[] | number) => void;
}) {
  const [locationInput, setLocationInput] = useState('');

  if (question.type === 'single') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options?.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={answer === option.value ? "default" : "outline"}
              className={`w-full p-4 h-auto justify-start ${
                answer === option.value 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onAnswer(question.id, option.value)}
            >
              <div className="flex items-center gap-3">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  if (question.type === 'multiple') {
    const selectedAnswers = Array.isArray(answer) ? answer : [];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options?.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={selectedAnswers.includes(option.value) ? "default" : "outline"}
              className={`w-full p-4 h-auto justify-start ${
                selectedAnswers.includes(option.value)
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                const newAnswers = selectedAnswers.includes(option.value)
                  ? selectedAnswers.filter(a => a !== option.value)
                  : [...selectedAnswers, option.value];
                onAnswer(question.id, newAnswers);
              }}
            >
              <div className="flex items-center gap-3">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  if (question.type === 'slider') {
    const sliderValue = typeof answer === 'number' ? answer : question.min || 0;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            ${sliderValue?.toLocaleString()}
          </div>
          <p className="text-gray-600">per month</p>
        </div>
        
        <div className="px-4">
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step}
            value={sliderValue}
            onChange={(e) => onAnswer(question.id, parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>${question.min?.toLocaleString()}</span>
            <span>${question.max?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  if (question.type === 'location') {
    return (
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter city, state, or ZIP code"
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              onAnswer(question.id, e.target.value);
            }}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['California', 'Florida', 'Texas', 'New York', 'Arizona', 'Nevada'].map((state) => (
            <Button
              key={state}
              variant="outline"
              size="sm"
              onClick={() => {
                setLocationInput(state);
                onAnswer(question.id, state);
              }}
              className="text-sm"
            >
              {state}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}