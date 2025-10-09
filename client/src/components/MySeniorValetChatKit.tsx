import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface MySeniorValetChatKitProps {
  category?: 'communities' | 'services' | 'healthcare' | 'resources' | 'vendors';
  onCategoryChange?: (category: string) => void;
  className?: string;
}

export function MySeniorValetChatKit({ 
  category = 'communities', 
  onCategoryChange,
  className = ''
}: MySeniorValetChatKitProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "👋 Hi! I'm your MySeniorValet assistant. I can answer questions about senior care and help you find communities from our database of 33,000+ verified options. What would you like to know?",
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session once on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize ChatKit session with thread
  const initializeSession = async () => {
    try {
      // Check if we have a stored thread ID
      const storedThreadId = localStorage.getItem('chatkit_thread_id');
      
      const response = await fetch('/api/chatkit/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: storedThreadId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreadId(data.thread_id);
        setAssistantId(data.assistant_id);
        
        // Store thread ID for conversation persistence
        localStorage.setItem('chatkit_thread_id', data.thread_id);
        
        setSessionReady(true);
        
        console.log('✅ ChatKit session initialized:', data.thread_id);
      }
    } catch (error) {
      console.error('Failed to initialize ChatKit session:', error);
      toast({
        title: "Connection Error",
        description: "Failed to start chat session",
        variant: "destructive"
      });
    }
  };

  // Handle sending messages with streaming
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !threadId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Call streaming endpoint
      const response = await fetch('/api/chatkit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          thread_id: threadId
        })
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update the assistant message with accumulated text
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      console.log('✅ Streaming complete');

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the placeholder message and show error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    localStorage.removeItem('chatkit_thread_id');
    setMessages([]);
    setThreadId(null);
    setAssistantId(null);
    initializeSession();
  };

  return (
    <Card className={`flex flex-col h-[600px] shadow-lg ${className}`} data-testid="chatkit-container">
      <CardHeader className="border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-lg">MySeniorValet Assistant</h3>
          </div>
          {threadId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-white hover:bg-white/20"
              data-testid="button-clear-chat"
            >
              New Chat
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                data-testid={`message-${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : message.role === 'system'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {!sessionReady && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-500">Initializing chat...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                sessionReady
                  ? "Ask a question or search for communities..."
                  : "Connecting..."
              }
              disabled={!sessionReady || isLoading}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!sessionReady || isLoading || !inputValue.trim()}
              size="icon"
              className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by OpenAI • {threadId ? 'Conversation active' : 'Starting new chat'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
