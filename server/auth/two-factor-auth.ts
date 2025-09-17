/**
 * Two-Factor Authentication Service
 * Implements TOTP (Time-based One-Time Password) for 2FA
 */

import { createHmac, randomBytes } from 'crypto';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface TOTPSecret {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

/**
 * Generate a random secret for TOTP
 */
export function generateTOTPSecret(email: string): TOTPSecret {
  const secret = randomBytes(32).toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, 32);

  const issuer = 'MySeniorValet';
  const algorithm = 'SHA1';
  const digits = 6;
  const period = 30;

  // Format secret for manual entry (groups of 4 characters)
  const manualEntryKey = secret.match(/.{1,4}/g)?.join(' ') || secret;

  // Generate otpauth URL for QR code
  const otpauthUrl = `otpauth://totp/${issuer}:${encodeURIComponent(email)}?` +
    `secret=${secret}&` +
    `issuer=${encodeURIComponent(issuer)}&` +
    `algorithm=${algorithm}&` +
    `digits=${digits}&` +
    `period=${period}`;

  // Generate QR code URL using a QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(otpauthUrl)}`;

  return {
    secret,
    qrCode: qrCodeUrl,
    manualEntryKey
  };
}

/**
 * Generate a TOTP code from a secret
 */
function generateTOTP(secret: string, timeWindow: number = 0): string {
  const time = Math.floor(Date.now() / 1000 / 30) + timeWindow;
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time), 0);

  const hmac = createHmac('sha1', Buffer.from(secret, 'base64'));
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a TOTP code
 * Allows for time drift of +/- 1 window (30 seconds)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  // Check current window and +/- 1 window for time drift
  for (let window = -1; window <= 1; window++) {
    const expectedToken = generateTOTP(secret, window);
    if (expectedToken === token) {
      return true;
    }
  }
  return false;
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

/**
 * Hash backup codes for storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const bcrypt = await import('bcrypt');
  const hashedCodes: string[] = [];
  for (const code of codes) {
    const hashed = await bcrypt.hash(code, 10);
    hashedCodes.push(hashed);
  }
  return hashedCodes;
}

/**
 * Verify a backup code
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
 */
export function requires2FA(email: string): boolean {
  const adminEmails = [
    'william.cowell01@gmail.com',
    'admin@myseniorvalet.com'
  ];
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Enable 2FA for a user
 */
export async function enable2FA(userId: number, secret: string, backupCodes: string[]) {
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
 */
export async function disable2FA(userId: number) {
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
  }

  return codeUsed;
}