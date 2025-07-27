import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
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
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Changed to true to ensure table exists
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session is created
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only require secure in production
      sameSite: 'lax', // Added for better compatibility
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
      if (userEmail === 'William.cowell01@gmail.com') {
        userRole = 'super_admin';
        console.log('🔑 Super admin access granted to William.cowell01@gmail.com');
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
        profileImageUrl: claims["profile_image_url"] || null,
        password: 'replit_auth',
        role: userRole
      });
      
      if (userRole === 'super_admin') {
        console.log(`First user ${userEmail} created as super_admin`);
      }
    } else {
      // Update existing user
      user = await storage.updateUser(user.id, {
        email: userEmail,
        firstName: claims["first_name"] || null,
        lastName: claims["last_name"] || null,
        profileImageUrl: claims["profile_image_url"] || null
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
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

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

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
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

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Store the referrer URL to redirect back after login
    const returnTo = req.headers.referer || '/';
    (req.session as any).returnTo = returnTo;
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any, info: any) => {
      if (err || !user) {
        console.error("Authentication failed:", err || info);
        return res.redirect("/api/login?error=auth_failed");
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login failed:", loginErr);
          return res.redirect("/api/login?error=login_failed");
        }
        
        // Save session and redirect
        req.session.save(() => {
          const returnTo = (req.session as any).returnTo || "/";
          delete (req.session as any).returnTo;
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
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
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

    // Check if user is admin
    if (dbUser.role !== 'admin') {
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