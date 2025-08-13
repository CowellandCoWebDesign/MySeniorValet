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
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export function setupSocialAuth(app: any) {
  // Google OAuth Login Endpoint
  router.get('/api/auth/google', (req, res) => {
    // Get the current host from the request
    const protocol = req.protocol;
    const host = req.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    
    console.log('Google OAuth redirect URI:', redirectUri);
    
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

      // Get the current host from the request
      const protocol = req.protocol;
      const host = req.get('host');
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
      
      console.log('Google OAuth callback redirect URI:', redirectUri);

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

      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/login?error=auth_failed');
    }
  });

  // Facebook OAuth Login Endpoint
  router.get('/api/auth/facebook', (req, res) => {
    const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(
        process.env.NODE_ENV === 'production'
          ? 'https://www.myseniorvalet.com/api/auth/facebook/callback'
          : 'https://myseniorvalet.replit.app/api/auth/facebook/callback'
      )}` +
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

      // Exchange code for access token
      const tokenResponse = await axios.get(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}` +
        `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
        `&redirect_uri=${encodeURIComponent(
          process.env.NODE_ENV === 'production'
            ? 'https://www.myseniorvalet.com/api/auth/facebook/callback'
            : 'https://myseniorvalet.replit.app/api/auth/facebook/callback'
        )}` +
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

      // Redirect to dashboard
      res.redirect('/dashboard');
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