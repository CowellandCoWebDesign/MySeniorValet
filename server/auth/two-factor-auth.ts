/**
 * Two-Factor Authentication Service
 * Implements TOTP (Time-based One-Time Password) for 2FA
 * Uses speakeasy for proper Base32 encoding and qrcode for local QR generation
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface TOTPSecret {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

/**
 * Generate a secure TOTP secret with proper Base32 encoding
 */
export async function generateTOTPSecret(email: string): Promise<TOTPSecret> {
  const issuer = 'MySeniorValet';
  
  // Generate a secure secret using speakeasy with Base32 encoding
  const secret = speakeasy.generateSecret({
    length: 32,
    name: email,
    issuer: issuer
  });

  // Generate otpauth URL for QR code
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: email,
    issuer: issuer,
    encoding: 'base32'
  });

  // Generate QR code as data URL locally (never leaves server)
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });

  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
    manualEntryKey: formatSecretForManualEntry(secret.base32)
  };
}

/**
 * Format secret for manual entry (groups of 4 characters)
 */
function formatSecretForManualEntry(secret: string): string {
  // Format the Base32 secret into groups of 4 for easier manual entry
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

/**
 * Verify a TOTP code using speakeasy
 * Allows for time drift of +/- 1 window (30 seconds)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    // Verify with speakeasy using Base32 encoding
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow +/- 1 time window for clock drift
    });
    
    return verified;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * Uses cryptographically secure random generation
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8 random bytes for each backup code
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import('bcrypt');
  const hashedCodes: string[] = [];
  
  for (const code of codes) {
    // Use higher cost factor for backup codes since they're rarely used
    const hashed = await bcrypt.hash(code, 12);
    hashedCodes.push(hashed);
  }
  
  return hashedCodes;
}

/**
 * Verify a backup code against hashed codes
 */
export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  
  for (const hashedCode of hashedCodes) {
    const isValid = await bcrypt.compare(code, hashedCode);
    if (isValid) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user requires 2FA (admin accounts)
 * Admin accounts MUST have 2FA enabled
 */
export function requires2FA(email: string): boolean {
  const adminEmails = [
    'william.cowell01@gmail.com',
    'admin@myseniorvalet.com',
    'super_admin@myseniorvalet.com'
  ];
  
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Check if a user is an admin (used for 2FA enforcement)
 */
export async function isAdminUser(userId: number): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

/**
 * Enable 2FA for a user
 * Stores Base32 encoded secret and hashed backup codes
 */
export async function enable2FA(userId: number, secret: string, backupCodes: string[]) {
  // Verify the secret is valid Base32 before storing
  if (!isValidBase32(secret)) {
    throw new Error('Invalid secret format - must be Base32 encoded');
  }
  
  const hashedBackupCodes = await hashBackupCodes(backupCodes);
  
  await db
    .update(users)
    .set({
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
      twoFactorEnabled: true,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

/**
 * Disable 2FA for a user
 * Note: Admin users cannot disable 2FA
 */
export async function disable2FA(userId: number) {
  // Check if user is admin - admins cannot disable 2FA
  const isAdmin = await isAdminUser(userId);
  if (isAdmin) {
    throw new Error('Admin accounts cannot disable 2FA for security reasons');
  }
  
  await db
    .update(users)
    .set({
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorEnabled: false,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

/**
 * Use a backup code (removes it from the list)
 */
export async function useBackupCode(userId: number, code: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.twoFactorBackupCodes) {
    return false;
  }

  const bcrypt = await import('bcrypt');
  const remainingCodes: string[] = [];
  let codeUsed = false;

  for (const hashedCode of user.twoFactorBackupCodes as string[]) {
    const isValid = await bcrypt.compare(code, hashedCode);
    if (isValid && !codeUsed) {
      codeUsed = true; // Mark as used, don't add to remaining codes
    } else {
      remainingCodes.push(hashedCode); // Keep unused codes
    }
  }

  if (codeUsed) {
    // Update user with remaining codes
    await db
      .update(users)
      .set({
        twoFactorBackupCodes: remainingCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Log backup code usage for security monitoring
    console.log(`Backup code used for user ${userId} at ${new Date().toISOString()}`);
  }

  return codeUsed;
}

/**
 * Validate Base32 string format
 */
function isValidBase32(str: string): boolean {
  // Base32 alphabet (RFC 4648)
  const base32Regex = /^[A-Z2-7]+$/;
  return base32Regex.test(str);
}

/**
 * Get remaining backup codes count for a user
 */
export async function getRemainingBackupCodesCount(userId: number): Promise<number> {
  const [user] = await db
    .select({ backupCodes: users.twoFactorBackupCodes })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user || !user.backupCodes) {
    return 0;
  }
  
  return (user.backupCodes as string[]).length;
}

/**
 * Generate new backup codes for a user (replaces existing ones)
 */
export async function regenerateBackupCodes(userId: number): Promise<string[]> {
  const newCodes = generateBackupCodes(10);
  const hashedCodes = await hashBackupCodes(newCodes);
  
  await db
    .update(users)
    .set({
      twoFactorBackupCodes: hashedCodes,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
  
  return newCodes;
}