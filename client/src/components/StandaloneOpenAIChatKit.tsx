import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface StandaloneOpenAIChatKitProps {
  className?: string;
  title?: string;
}

/**
 * Standalone OpenAI ChatKit Component
 * This is a drop-in widget that uses OpenAI's ChatKit React package.
 * It's completely independent from the custom assistant implementation.
 */
export function StandaloneOpenAIChatKit({ 
  className = '',
  title = 'OpenAI ChatKit Widget'
}: StandaloneOpenAIChatKitProps) {
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<any>(null);
  const workflowId = import.meta.env.VITE_CHATKIT_WORKFLOW_ID || 'wf_68e81346207081908dd22b5dbe9efd52011fd36150caa759';

  console.log('[Standalone ChatKit] Component mounting with workflow:', workflowId);

  // Initialize ChatKit with secure client token
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          // If we have an existing token that's still valid, use it
          if (existing && sessionData?.expires_at) {
            const expiryTime = new Date(sessionData.expires_at).getTime();
            const now = Date.now();
            const timeUntilExpiry = expiryTime - now;
            
            if (timeUntilExpiry > 5 * 60 * 1000) {
              return existing;
            }
          }
          
          // Create new session with workflow ID
          const response = await fetch('/api/chatkit/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              workflow: { id: workflowId }
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to create ChatKit session');
          }
          
          const session = await response.json();
          setSessionData(session);
          
          console.log('[Standalone ChatKit] Session created successfully');
          return session.client_secret;
          
        } catch (error) {
          console.error('[Standalone ChatKit] Failed to get client secret:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to ChatKit service. Please try again.",
            variant: "destructive",
          });
          throw error;
        }
      },
    },
    onError: (error) => {
      console.error('[Standalone ChatKit] Error:', error);
      toast({
        title: "Chat Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Log when control is ready
  useEffect(() => {
    if (control) {
      console.log('[Standalone ChatKit] Control ready:', control);
    }
  }, [control]);

  // Log when session data changes
  useEffect(() => {
    if (sessionData) {
      console.log('[Standalone ChatKit] Session data updated:', {
        hasClientSecret: !!sessionData.client_secret,
        threadId: sessionData.thread_id
      });
    }
  }, [sessionData]);

  return (
    <Card className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            React Package
          </span>
        </div>
      </div>

      {/* ChatKit Component */}
      <ChatKit 
        control={control} 
        className="h-[600px] w-full"
      />

      {/* Footer */}
      <div className="p-3 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenAI ChatKit React • Independent Widget
        </p>
      </div>
    </Card>
  );
}
