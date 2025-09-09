import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      new BrowserTracing(),
    ],
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      if (event.exception) {
        const error = hint.originalException;
        // Don't send network errors in development
        if (import.meta.env.MODE === 'development' && error?.message?.includes('Network')) {
          return null;
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry error monitoring initialized');
}

// Custom error boundary hook
export function useSentryErrorBoundary() {
  return Sentry.ErrorBoundary;
}

// Track custom events
export function trackSentryEvent(message: string, level: Sentry.SeverityLevel = 'info', extra?: Record<string, any>) {
  Sentry.captureMessage(message, level);
  if (extra) {
    Sentry.setContext('extra_data', extra);
  }
}

// Track user interactions
export function trackSentryUser(user: { id: string | number; email?: string; username?: string }) {
  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.username,
  });
}

// Clear user on logout
export function clearSentryUser() {
  Sentry.setUser(null);
}