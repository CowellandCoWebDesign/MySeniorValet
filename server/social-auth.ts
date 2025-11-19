/**
 * Social Authentication (Google & Facebook OAuth)
 * Provides convenient social login options alongside email/password
 */

import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

const router = Router();

// Google OAuth Configuration
console.log('Google OAuth Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 30) + '...');
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export function setupSocialAuth(app: any) {
  // Google OAuth Login Endpoint
  router.get('/api/auth/google', (req, res) => {
    // SECURITY: Validate host against whitelist with EXACT matching to prevent bypasses
    const requestHost = req.get('host');
    const requestProtocol = req.get('x-forwarded-proto') || req.protocol;

    // Whitelist of allowed domains (development and production) - EXACT MATCH ONLY
    const ALLOWED_HOSTS = [
      'localhost:5000',
      '7a9daf58-f7c7-49c7-b4de-a709c13987b5-00-3l1b8tvcpa4bp.janeway.replit.dev', // Development
      'workspace-williamcowell01.replit.app', // Production
      'myseniorvalet.com', // Custom domain
      'www.myseniorvalet.com' // Custom domain with www
    ];

    // SECURITY: Use exact host matching (not substring) to prevent bypass attacks
    const isValidHost = ALLOWED_HOSTS.includes(requestHost || '');

    // SECURITY: Only allow https protocol (reject javascript:, data:, etc.)
    const isSafeProtocol = requestProtocol === 'https' || requestProtocol === 'http';

    if (!isValidHost || !isSafeProtocol) {
      console.error(`🚨 SECURITY: Invalid host/protocol in Google OAuth - Host: ${requestHost}, Protocol: ${requestProtocol}`);
      return res.status(400).json({ error: 'Invalid request origin' });
    }

    // Use validated host and protocol for redirect URI
    const redirectUri = `${requestProtocol}://${requestHost}/api/auth/google/callback`;

    console.log('Google OAuth redirect URI (validated):', redirectUri);

    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      redirect_uri: redirectUri
    });
    res.redirect(authUrl);
  });

  // Google OAuth Callback
  router.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect('/login?error=no_code');
      }

      // SECURITY: Use same consistent redirect URI as the initial auth request
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalhost = req.get('host')?.includes('localhost');

      let redirectUri;
      if (isLocalhost) {
        redirectUri = 'http://localhost:5000/api/auth/google/callback';
      } else if (isProduction) {
        redirectUri = 'https://myseniorvalet.com/api/auth/google/callback';
      } else {
        redirectUri = 'https://workspace-williamcowell01.replit.app/api/auth/google/callback';
      }

      console.log('🔐 Google OAuth callback processing with redirect URI:', redirectUri);

      // Exchange code for tokens
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });

      // Get user info from Google
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      const googleUser = response.data;

      // Check if user exists or create new user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email.toLowerCase()))
        .limit(1);

      if (!user) {
        // Create new user from Google data
        [user] = await db
          .insert(users)
          .values({
            email: googleUser.email.toLowerCase(),
            firstName: googleUser.given_name || '',
            lastName: googleUser.family_name || '',
            profileImageUrl: googleUser.picture,
            emailVerified: googleUser.verified_email || false,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      } else {
        // Update profile image if changed
        if (googleUser.picture && googleUser.picture !== user.profileImageUrl) {
          await db
            .update(users)
            .set({ 
              profileImageUrl: googleUser.picture,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      };

      // Save session explicitly before redirecting
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/login?error=session_error');
        }
        console.log('Google OAuth successful for user:', user.email);

        // Check if user was trying to make a payment
        const redirectTo = (req.session as any).redirectAfterLogin || '/dashboard';
        delete (req.session as any).redirectAfterLogin;

        res.redirect(redirectTo);
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/login?error=auth_failed');
    }
  });

  // Facebook OAuth Login Endpoint
  router.get('/api/auth/facebook', (req, res) => {
    // Determine the correct redirect URI based on environment
    let redirectUri: string;

    // Always use the current host for the redirect URI
    const host = req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;

    // Use the actual host the request came from
    redirectUri = `${protocol}://${host}/api/auth/facebook/callback`;

    const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=email,public_profile` +
      `&response_type=code`;

    res.redirect(fbAuthUrl);
  });

  // Facebook OAuth Callback
  router.get('/api/auth/facebook/callback', async (req, res) => {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect('/login?error=no_code');
      }

      // Determine the correct redirect URI based on environment
      const host = req.get('host');
      const protocol = req.get('x-forwarded-proto') || req.protocol;

      // Use the actual host the request came from
      let redirectUri: string;
      redirectUri = `${protocol}://${host}/api/auth/facebook/callback`;

      // Exchange code for access token
      const tokenResponse = await axios.get(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}` +
        `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&code=${code}`
      );

      const { access_token } = tokenResponse.data;

      // Get user info from Facebook
      const userResponse = await axios.get(
        `https://graph.facebook.com/v18.0/me?` +
        `fields=id,email,first_name,last_name,picture.type(large)` +
        `&access_token=${access_token}`
      );

      const fbUser = userResponse.data;

      // Check if user exists or create new user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, fbUser.email.toLowerCase()))
        .limit(1);

      if (!user) {
        // Create new user from Facebook data
        [user] = await db
          .insert(users)
          .values({
            email: fbUser.email.toLowerCase(),
            firstName: fbUser.first_name || '',
            lastName: fbUser.last_name || '',
            profileImageUrl: fbUser.picture?.data?.url,
            emailVerified: true, // Facebook emails are verified
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
      } else {
        // Update profile image if changed
        if (fbUser.picture?.data?.url && fbUser.picture.data.url !== user.profileImageUrl) {
          await db
            .update(users)
            .set({ 
              profileImageUrl: fbUser.picture.data.url,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      };

      // Save session explicitly before redirecting
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/login?error=session_error');
        }
        console.log('Facebook OAuth successful for user:', user.email);

        // Check if user was trying to make a payment
        const redirectTo = (req.session as any).redirectAfterLogin || '/dashboard';
        delete (req.session as any).redirectAfterLogin;

        res.redirect(redirectTo);
      });
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      res.redirect('/login?error=auth_failed');
    }
  });

  // Apple Sign In (for future implementation)
  router.post('/api/auth/apple', async (req, res) => {
    // Apple Sign In uses a different flow with JWT tokens
    // Implementation would go here when Apple Developer account is set up
    res.status(501).json({ 
      message: 'Apple Sign In coming soon',
      info: 'Requires Apple Developer account setup' 
    });
  });

  // Debug endpoint to show OAuth configuration
  router.get('/api/auth/oauth-debug', (req, res) => {
    const host = req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const googleRedirectUri = `${protocol}://${host}/api/auth/google/callback`;
    const facebookRedirectUri = `${protocol}://${host}/api/auth/facebook/callback`;

    res.json({
      message: 'Add these exact URLs to your OAuth providers',
      google: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        clientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 30) + '...' : 'Not configured',
        redirectUri: googleRedirectUri,
        consoleUrl: 'https://console.cloud.google.com/apis/credentials',
        instructions: [
          '1. Go to Google Cloud Console using the link above',
          '2. Find your OAuth 2.0 Client ID',
          '3. Click on it to edit',
          '4. Under "Authorized redirect URIs", add the redirect URI shown above',
          '5. Click SAVE and wait 5-10 minutes'
        ]
      },
      facebook: {
        configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
        appId: process.env.FACEBOOK_APP_ID || 'Not configured',
        redirectUri: facebookRedirectUri,
        consoleUrl: 'https://developers.facebook.com/apps/',
        instructions: [
          '1. Go to Facebook Developers using the link above',
          '2. Select your app',
          '3. Go to Facebook Login > Settings',
          '4. Add the redirect URI shown above to "Valid OAuth Redirect URIs"',
          '5. Save Changes'
        ]
      },
      currentRequest: {
        protocol: protocol,
        host: host,
        fullUrl: `${protocol}://${host}`
      }
    });
  });

  app.use(router);

  console.log('✅ Social authentication initialized (Google & Facebook OAuth)');
}

// Helper function to check if social auth is configured
export function isSocialAuthConfigured(): {
  google: boolean;
  facebook: boolean;
  apple: boolean;
} {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    apple: false, // Not yet implemented
  };
}