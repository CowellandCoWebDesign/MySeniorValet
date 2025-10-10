import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChatKitWrapperProps {
  clientSecret: string;
  threadId?: string;
  className?: string;
  onClose?: () => void;
  onNewConversation?: () => void;
}

export function ChatKitWrapper({ 
  clientSecret, 
  threadId,
  className = '',
  onClose,
  onNewConversation 
}: ChatKitWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('[ChatKitWrapper] Component rendering with:', {
    hasClientSecret: !!clientSecret,
    clientSecretPrefix: clientSecret?.substring(0, 10),
    threadId
  });

  // Initialize ChatKit with the client_secret
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        console.log('[ChatKit Wrapper] getClientSecret called:', {
          hasExisting: !!existing,
          hasClientSecret: !!clientSecret
        });
        
        // Always return the provided client_secret
        if (clientSecret) {
          console.log('[ChatKit Wrapper] Returning client_secret:', clientSecret.substring(0, 10) + '...');
          return clientSecret;
        }
        
        console.log('[ChatKit Wrapper] No client_secret available');
        return '';
      },
    },
  });

  useEffect(() => {
    console.log('[ChatKitWrapper] Component mounted, control:', control);
  }, [control]);

  return (
    <Card className={`relative overflow-hidden ${className} ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">ChatKit Beta</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            with Widgets
          </span>
          {threadId && (
            <span className="text-xs text-muted-foreground">
              Thread: {threadId.slice(-8)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onNewConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewConversation}
              title="Start new conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Real ChatKit Component */}
      <ChatKit 
        control={control} 
        className={`${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'} w-full`}
      />

      {/* Footer */}
      <div className="p-3 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          OpenAI ChatKit with Widgets • Search 33,834+ communities • Interactive Cards & Forms
        </p>
      </div>
    </Card>
  );
}
