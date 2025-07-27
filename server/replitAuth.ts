import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
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
      // Create new user - use Replit user ID as primary key with default 'user' role
      const result = await db.execute(sql`
        INSERT INTO users (id, username, email, first_name, last_name, profile_image_url, password, role)
        VALUES (${replitUserId}, ${userEmail}, ${userEmail}, ${claims["first_name"] || null}, ${claims["last_name"] || null}, ${claims["profile_image_url"] || null}, 'replit_auth', 'user')
        RETURNING id, username, email, first_name AS "firstName", last_name AS "lastName", profile_image_url AS "profileImageUrl", role
      `);
      user = result.rows[0] as any;
    } else {
      // Update existing user
      await db.execute(sql`
        UPDATE users 
        SET email = ${userEmail}, 
            first_name = ${claims["first_name"] || null}, 
            last_name = ${claims["last_name"] || null}, 
            profile_image_url = ${claims["profile_image_url"] || null}
        WHERE id = ${user.id}
      `);
      // Update the user object with the new claims data
      user.firstName = claims["first_name"] || user.firstName;
      user.lastName = claims["last_name"] || user.lastName;
      user.profileImageUrl = claims["profile_image_url"] || user.profileImageUrl;
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
    const user: any = {};
    updateUserSession(user, tokens);
    const dbUser = await upsertUser(tokens.claims());
    // Add database user info to session user object
    user.dbUserId = dbUser.id;
    user.email = dbUser.email;
    verified(null, user);
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
    passport.authenticate(`replitauth:${req.hostname}`, {
      successRedirect: (req.session as any).returnTo || "/",
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