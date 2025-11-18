import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  // Normalize email to lowercase for consistent database operations
  const userEmail = claims["email"]?.toLowerCase();
  const replitAuthId = claims["sub"]; // This is the Replit OIDC sub claim
  
  // First, try to find user by auth_id
  let user = await storage.getUserByAuthId(replitAuthId);
  
  if (user) {
    // User already exists with this auth_id - update profile from Replit
    user = await storage.updateUserFromReplit(user.id as unknown as number, {
      firstName: claims["first_name"] || null,
      lastName: claims["last_name"] || null,
      profileImageUrl: claims["profile_image_url"] || null
    }) || user;
    return user;
  }
  
  // User not found by auth_id - check if there's an existing user with this email
  const existingUserByEmail = await storage.getUserByEmail(userEmail);
  
  if (existingUserByEmail) {
    // Existing user without auth_id - link them to Replit Auth
    await storage.linkUserToReplitAuth(existingUserByEmail.id as unknown as number, replitAuthId, userEmail);
    // Fetch the updated user
    user = await storage.getUserByAuthId(replitAuthId);
    console.log(`✅ Linked existing user ${userEmail} (ID: ${existingUserByEmail.id}) to Replit Auth`);
    return user;
  }
  
  // Completely new user - determine role and create
  const superAdminEmails = ['william.cowell01@gmail.com', 'admin@myseniorvalet.com'];
  const superAdminCount = await storage.getSuperAdminCount();
  const userRole = superAdminEmails.includes(userEmail?.toLowerCase()) 
    ? 'super_admin' 
    : (superAdminCount === 0 ? 'super_admin' : 'user');
  
  // Create new user with Replit Auth
  user = await storage.createReplitUser({
    authId: replitAuthId,
    email: userEmail,
    firstName: claims["first_name"] || null,
    lastName: claims["last_name"] || null,
    profileImageUrl: claims["profile_image_url"] || null,
    role: userRole
  });
  
  console.log(`✅ Created new Replit Auth user ${userEmail} with role ${userRole}`);
  return user;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Only initialize passport if not already initialized
  if (!(app as any)._passport) {
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      console.log('🔐 Verify function called with claims:', {
        email: tokens.claims()?.email,
        sub: tokens.claims()?.sub,
        has_access_token: !!tokens.access_token,
        has_refresh_token: !!tokens.refresh_token
      });
      
      const user: any = {};
      updateUserSession(user, tokens);
      const dbUser = await upsertUser(tokens.claims());
      
      // Ensure dbUser exists before accessing properties
      if (dbUser) {
        user.dbUserId = dbUser.id;
        user.email = dbUser.email;
        console.log('✅ User verified and upserted:', {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role
        });
      } else {
        console.error('❌ Failed to upsert user to database');
        throw new Error('Failed to create or update user in database');
      }
      
      verified(null, user);
    } catch (error) {
      console.error("❌ Verify function error:", {
        message: (error as any).message,
        stack: (error as any).stack,
        error: error
      });
      verified(error as Error, null);
    }
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
  
  // Debug route to catch any OAuth-related callbacks
  app.get("/oidc/*", (req, res) => {
    console.log('🚨 OIDC route hit:', {
      path: req.path,
      url: req.url,
      query: req.query,
      hostname: req.hostname
    });
    res.redirect('/');
  });
  
  app.get("/oauth/*", (req, res) => {
    console.log('🚨 OAuth route hit:', {
      path: req.path,
      url: req.url,
      query: req.query,
      hostname: req.hostname
    });
    res.redirect('/');
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // PRODUCTION FIX: Check both cookie parsing methods
  const cookies = (req as any).cookies || {};
  const sessionId = cookies.sessionId || req.cookies?.sessionId;
  
  // Priority 1: Check for standard auth session (works everywhere)
  if (sessionId) {
    // Check in-memory sessions
    if (global.activeSessions?.[sessionId]) {
      const session = global.activeSessions[sessionId];
      (req as any).user = {
        claims: {
          sub: session.userId,
          email: session.email
        },
        id: session.userId,
        email: session.email,
        role: session.role,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      (req as any).isAuthenticated = () => true;
      return next();
    }
    
    // Check database sessions
    try {
      const result = await db.execute(sql`
        SELECT u.* FROM user_sessions us
        JOIN users u ON u.id = us.user_id
        WHERE us.id = ${sessionId} AND us.expires_at > NOW()
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        (req as any).user = {
          claims: {
            sub: user.id,
            email: user.email
          },
          id: user.id,
          email: user.email,
          role: user.role,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        };
        (req as any).isAuthenticated = () => true;
        return next();
      }
    } catch (error) {
      console.error('Session lookup error:', error);
    }
  }
  
  // Priority 2: Check Replit OAuth (production deployment)
  const user = req.user as any;
  if (req.isAuthenticated() && user?.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }
    
    // Try to refresh token
    const refreshToken = user.refresh_token;
    if (refreshToken) {
      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
  }
  
  // No valid authentication found
  return res.status(401).json({ message: "Unauthorized" });
};

// Admin-only middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  // Check for demo mode in development
  const sessionId = (req as any).cookies?.sessionId;
  
  if (!sessionId && process.env.NODE_ENV === 'development') {
    // Demo super admin user for testing
    (req as any).dbUser = {
      id: 'test-user-123',
      email: 'William.cowell01@gmail.com',
      username: 'William Cowell',
      role: 'super_admin',
      isDemo: true
    };
    return next();
  }
  
  // Check for active session
  if (sessionId && global.activeSessions?.[sessionId]) {
    const session = global.activeSessions[sessionId];
    
    // Check if user has admin or super_admin role
    if (session.role !== 'admin' && session.role !== 'super_admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    (req as any).dbUser = {
      id: session.userId,
      email: session.email,
      role: session.role
    };
    return next();
  }
  
  const user = req.user as any;

  // First check if authenticated
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get user from database to check role
    const userEmail = user.claims?.email || user.email;
    if (!userEmail) {
      return res.status(401).json({ message: "No user email found" });
    }

    const dbUser = await storage.getUserByEmail(userEmail);
    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user is admin or super_admin
    if (dbUser.role !== 'admin' && dbUser.role !== 'super_admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Attach user to request for use in routes
    (req as any).dbUser = dbUser;
    
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

// Enhanced role checking middleware
export const checkRole = (allowedRoles: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    
    // First check if authenticated
    if (!req.isAuthenticated() || !user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // Get user from database to check role
      const userEmail = user.claims?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "No user email found" });
      }
      
      const dbUser = await storage.getUserByEmail(userEmail);
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Super admin has access to everything
      if (dbUser.role === 'super_admin') {
        (req as any).dbUser = dbUser;
        next();
        return;
      }
      
      // Check if user's role is in allowed roles
      if (!dbUser.role || !allowedRoles.includes(dbUser.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }
      
      // Attach user to request for use in routes
      (req as any).dbUser = dbUser;
      
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Authentication error" });
    }
  };
};

// Helper function to programmatically log in a user after payment
export async function createAuthenticatedSession(req: any, email: string, firstName?: string, lastName?: string): Promise<any> {
  try {
    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Check if this is William Cowell (guaranteed super admin)
      let userRole = 'user';
      if (email === 'William.cowell01@gmail.com') {
        userRole = 'super_admin';
        console.log('🔑 Super admin access granted to William.cowell01@gmail.com');
      } else {
        // Check if this is the first user (no super_admin exists)
        const superAdminCount = await storage.getSuperAdminCount();
        userRole = superAdminCount === 0 ? 'super_admin' : 'user';
      }
      
      // Don't pass an ID - let the database auto-generate it
      user = await storage.createUser({
        username: email,
        email: email,
        firstName: firstName || null,
        lastName: lastName || null,
        password: 'payment_auth_' + Math.random().toString(36).substring(7),
        role: userRole
      });
      
      console.log(`Created new user ${email} via payment flow`);
    }
    
    // Create a session object that mimics the Replit Auth structure
    const sessionUser = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 1 week expiry
      },
      access_token: 'payment_session_' + Math.random().toString(36).substring(7),
      refresh_token: 'payment_refresh_' + Math.random().toString(36).substring(7),
      expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    };
    
    // Log the user in programmatically
    await new Promise((resolve, reject) => {
      req.logIn(sessionUser, (err: any) => {
        if (err) {
          console.error('Failed to create session:', err);
          reject(err);
        } else {
          console.log(`Authenticated session created for ${email}`);
          resolve(true);
        }
      });
    });
    
    // Save the session
    await new Promise((resolve) => {
      req.session.save(() => {
        resolve(true);
      });
    });
    
    return user;
  } catch (error) {
    console.error('Error creating authenticated session:', error);
    throw error;
  }
};