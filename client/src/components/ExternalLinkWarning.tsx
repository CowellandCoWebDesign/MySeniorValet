import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ExternalLinkWarningProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  domain?: string;
}

export function ExternalLinkWarning({ href, children, className, domain }: ExternalLinkWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setTargetUrl(href);
    setShowWarning(true);
  };

  const handleContinue = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setShowWarning(false);
  };

  const handleReportIssue = async () => {
    try {
      const response = await fetch('/api/feedback/incorrect-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUrl: targetUrl,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast({
          title: "Thank you for your feedback!",
          description: "We'll review this link and work on improving our accuracy.",
          variant: "default",
        });
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      toast({
        title: "Unable to send feedback",
        description: "Please try again later or contact hello@myseniorvalet.com",
        variant: "destructive",
      });
    }
    setShowWarning(false);
  };

  // Extract domain from URL for display
  const getDomain = (url: string) => {
    if (domain) return domain;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'external website';
    }
  };

  return (
    <>
      <a 
        href={href}
        onClick={handleClick}
        className={className || "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center gap-1"}
        rel="noopener noreferrer"
      >
        {children}
        <ExternalLink className="w-3 h-3" />
      </a>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              You're Leaving MySeniorValet
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to leave MySeniorValet and visit an external website.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium mb-1">Destination:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {getDomain(targetUrl)}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Please Note:</strong> We expect this is the right website for this community, but we don't always get it right. We're learning and getting better every day!
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>Found an incorrect link?</strong> Help us improve!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReportIssue}
                  className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                >
                  <MessageSquare className="w-4 h-4" />
                  Report Incorrect Link
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This link will open in a new tab. MySeniorValet is not responsible for the content or privacy practices of external websites.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on MySeniorValet</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>
              Continue to External Site
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}