import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";

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
  
  // Replit ALWAYS uses HTTPS, even in development
  const isReplit = !!process.env.REPL_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🔐 Session configuration:', {
    environment: process.env.NODE_ENV,
    isReplit,
    secureCookies: isReplit || isProduction,
    domain: process.env.REPLIT_DOMAINS?.split(',')[0]
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isReplit || isProduction, // CRITICAL: Replit always needs secure cookies
      sameSite: 'lax',
      maxAge: sessionTtl,
      // Don't set domain - let browser handle it automatically
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

async function upsertUser(
  claims: any,
) {
  // Handle ID mapping between Replit Auth (string) and database (varchar)
  const userEmail = claims["email"];
  const replitUserId = claims["sub"];
  
  try {
    // Check if user exists by email first
    let user = await storage.getUserByEmail(userEmail);
    
    if (!user) {
      // Check if this is William Cowell (guaranteed super admin)
      let userRole = 'user';
      const superAdminEmails = ['William.cowell01@gmail.com', 'admin@myseniorvalet.com'];
      
      if (superAdminEmails.includes(userEmail)) {
        userRole = 'super_admin';
        console.log(`🔑 Super admin access granted to ${userEmail}`);
      } else {
        // Check if this is the first user (no super_admin exists)
        const superAdminCount = await storage.getSuperAdminCount();
        userRole = superAdminCount === 0 ? 'super_admin' : 'user';
      }
      
      // Create new user - use Replit user ID as primary key
      user = await storage.createUser({
        id: replitUserId,
        username: userEmail,
        email: userEmail,
        firstName: claims["first_name"] || null,
        lastName: claims["last_name"] || null,
        password: 'replit_auth',
        role: userRole
      });
      
      if (userRole === 'super_admin') {
        console.log(`First user ${userEmail} created as super_admin`);
      }
    } else {
      // Update existing user
      user = await storage.updateUser(String(user.id), {
        email: userEmail,
        firstName: claims["first_name"] || null,
        lastName: claims["last_name"] || null
      }) || user;
    }
    
    return user;
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
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
      const user: any = {};
      updateUserSession(user, tokens);
      const dbUser = await upsertUser(tokens.claims());
      
      // Ensure dbUser exists before accessing properties
      if (dbUser) {
        user.dbUserId = dbUser.id;
        user.email = dbUser.email;
      }
      
      verified(null, user);
    } catch (error) {
      console.error("Verify function error:", error);
      verified(error as Error, null);
    }
  };

  // Get domains from environment variable
  const replitDomains = process.env.REPLIT_DOMAINS?.split(",") || [];
  
  // Add production deployment domain if not included (case-sensitive!)
  const productionDomain = 'MySeniorValet.replit.app';
  if (!replitDomains.includes(productionDomain)) {
    replitDomains.push(productionDomain);
  }
  
  // Also handle custom domain when it's configured
  const customDomain = 'www.myseniorvalet.com';
  if (!replitDomains.includes(customDomain)) {
    replitDomains.push(customDomain);
  }
  
  // Also add lowercase version just in case
  const productionDomainLower = 'myseniorvalet.replit.app';
  if (!replitDomains.includes(productionDomainLower)) {
    replitDomains.push(productionDomainLower);
  }
  
  console.log('Configuring auth for domains:', replitDomains);

  for (const domain of replitDomains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Error serializing user:', error);
      cb(error, null);
    }
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    try {
      cb(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      cb(null, null); // Don't crash on deserialize error
    }
  });

  app.get("/api/login", (req, res, next) => {
    // Store the referrer URL to redirect back after login
    const returnTo = req.headers.referer || '/';
    (req.session as any).returnTo = returnTo;
    
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`Login attempt for hostname: ${req.hostname}`);
    
    // Use standard passport authenticate without custom callback for login
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log('🚨 CALLBACK HIT! Full details:', {
      url: req.url,
      hostname: req.hostname,
      query: req.query,
      sessionID: req.sessionID,
      hasCookies: !!req.headers.cookie
    });
    
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`🔍 OAuth Callback Debug:`, {
      hostname: req.hostname,
      query: req.query,
      hasSession: !!req.session,
      sessionID: req.sessionID,
      headers: {
        referer: req.headers.referer,
        cookie: req.headers.cookie ? 'exists' : 'missing'
      }
    });
    
    passport.authenticate(strategyName, (err: any, user: any, info: any) => {
      console.log(`🔍 Passport authenticate result:`, {
        hasError: !!err,
        hasUser: !!user,
        info: info,
        error: err?.message || err
      });
      
      if (err || !user) {
        console.error("❌ Authentication failed:", err || info);
        return res.redirect("/login?error=auth_failed");
      }
      
      console.log('✅ User authenticated, logging in...', {
        userEmail: user.claims?.email,
        userId: user.claims?.sub
      });
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Session login failed:", loginErr);
          return res.redirect("/login?error=login_failed");
        }
        
        console.log('✅ User logged in, saving session...');
        
        // Save session and redirect
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("❌ Session save failed:", saveErr);
            return res.redirect("/login?error=session_failed");
          }
          
          const returnTo = (req.session as any).returnTo || "/";
          delete (req.session as any).returnTo;
          
          console.log('✅ Session saved, redirecting to:', returnTo);
          res.redirect(returnTo);
        });
      });
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
  // Check for demo mode in development
  const sessionId = (req as any).cookies?.sessionId;
  
  if (!sessionId && process.env.NODE_ENV === 'development') {
    // Demo super admin user for testing
    (req as any).user = {
      id: 'test-user-123',
      email: 'William.cowell01@gmail.com',
      username: 'William Cowell',
      role: 'super_admin',
      isDemo: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    (req as any).isAuthenticated = () => true;
    return next();
  }
  
  // Check for active session
  if (sessionId && global.activeSessions?.[sessionId]) {
    const session = global.activeSessions[sessionId];
    (req as any).user = {
      id: session.userId,
      email: session.email,
      role: session.role,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
    (req as any).isAuthenticated = () => true;
    return next();
  }
  
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
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