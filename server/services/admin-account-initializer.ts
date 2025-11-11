import { db } from '../db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { PasswordChangeLogger } from '../middleware/password-change-logger';

interface AdminAccount {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: 'william.cowell01@gmail.com',
    firstName: 'William',
    lastName: 'Cowell',
    username: 'william.cowell01'
  },
  {
    email: 'admin@myseniorvalet.com',
    firstName: 'MySeniorValet',
    lastName: 'Admin',
    username: 'admin'
  }
];

export async function initializeAdminAccounts() {
  try {
    console.log('\n🔐 Checking admin account initialization...');
    
    // Get the admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || 'MySV@Admin2025!';
    
    // Check if we're in production and warn about default password
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
      console.warn('⚠️  WARNING: Using default admin password in production! Set ADMIN_PASSWORD environment variable!');
    }
    
    // Hash the password once for all admin accounts
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    for (const adminAccount of ADMIN_ACCOUNTS) {
      // Check if account exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, adminAccount.email))
        .limit(1);
      
      if (existingUser) {
        console.log(`✅ Admin account already exists: ${adminAccount.email}`);
        
        // If user exists but is not a super admin, upgrade them
        if (existingUser.role !== 'super_admin') {
          await db
            .update(users)
            .set({
              role: 'super_admin',
              isActive: true,
              emailVerified: true,
              updatedAt: new Date()
            })
            .where(eq(users.id, existingUser.id));
          
          console.log(`⬆️  Upgraded ${adminAccount.email} to super_admin role`);
        }
      } else {
        // Create new admin account
        const [newUser] = await db
          .insert(users)
          .values({
            email: adminAccount.email,
            username: adminAccount.username,
            password: hashedPassword,
            firstName: adminAccount.firstName,
            lastName: adminAccount.lastName,
            role: 'super_admin',
            emailVerified: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        console.log(`🆕 Created admin account: ${adminAccount.email}`);
        
        // Log password creation for audit
        await PasswordChangeLogger.logPasswordChange(
          newUser.id,
          newUser.email || adminAccount.email,
          'password_created',
          'system_initialization',
          'system',
          'Server Startup'
        );
      }
    }
    
    // Print access information
    console.log('\n📋 Admin Account Access Information:');
    console.log('━'.repeat(50));
    for (const adminAccount of ADMIN_ACCOUNTS) {
      console.log(`Email: ${adminAccount.email}`);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`\nDevelopment Password: Use ADMIN_PASSWORD env var or default`);
    } else {
      console.log(`\nProduction: Password from ADMIN_PASSWORD env var`);
    }
    console.log('━'.repeat(50));
    console.log('✅ Admin account initialization complete\n');
    
  } catch (error) {
    console.error('❌ Failed to initialize admin accounts:', error);
    // Don't crash the server if admin initialization fails
    // The app can still run, admins just need manual setup
  }
}

// Export function to check if a user is a super admin
export async function isSuperAdmin(email: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user?.role === 'super_admin';
}

// Export function to reset admin password (for emergency use)
export async function resetAdminPassword(email: string, newPassword: string): Promise<boolean> {
  // Only allow resetting admin accounts defined in our system
  const isValidAdmin = ADMIN_ACCOUNTS.some(acc => acc.email === email);
  if (!isValidAdmin) {
    console.error(`❌ ${email} is not a recognized admin account`);
    return false;
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const result = await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date()
    })
    .where(eq(users.email, email));
  
  if (result) {
    console.log(`✅ Password reset for admin: ${email}`);
    return true;
  }
  
  return false;
}