import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface PaymentSuccessData {
  sessionId: string | null;
  isSuccess: boolean;
  tierKey?: string;
}

export function usePaymentSuccess() {
  const [location] = useLocation();
  const [successData, setSuccessData] = useState<PaymentSuccessData>({
    sessionId: null,
    isSuccess: false
  });

  useEffect(() => {
    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const subscriptionParam = urlParams.get('subscription');
    
    if (sessionId && subscriptionParam === 'success') {
      setSuccessData({
        sessionId,
        isSuccess: true
      });
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  const clearSuccess = () => {
    setSuccessData({
      sessionId: null,
      isSuccess: false
    });
  };

  return { ...successData, clearSuccess };
}