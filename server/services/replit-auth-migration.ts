import { db } from "../db";
import { sql } from "drizzle-orm";
import { storage } from "../storage";
import crypto from "crypto";

/**
 * Service to handle migration of existing users to Replit Auth
 * Uses dual-identifier approach to preserve existing relationships
 */
export class ReplitAuthMigrationService {
  
  /**
   * Pre-generate stable auth IDs for admin accounts
   * These will be used if the accounts don't have Replit Auth IDs yet
   */
  private static readonly ADMIN_AUTH_IDS = {
    'william.cowell01@gmail.com': 'replit_auth_william_' + crypto.randomBytes(8).toString('hex'),
    'admin@myseniorvalet.com': 'replit_auth_admin_' + crypto.randomBytes(8).toString('hex')
  };

  /**
   * Link existing admin accounts to Replit Auth
   * This ensures admin access is preserved during migration
   */
  static async linkAdminAccounts(): Promise<void> {
    console.log('🔐 Linking admin accounts to Replit Auth...');
    
    const adminEmails = ['william.cowell01@gmail.com', 'admin@myseniorvalet.com'];
    
    for (const email of adminEmails) {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (user && !user.authId) {
          // Generate a stable auth ID for this admin
          const authId = this.ADMIN_AUTH_IDS[email];
          
          await storage.linkUserToReplitAuth(
            user.id as unknown as number,
            authId,
            email
          );
          
          console.log(`✅ Admin account ${email} prepared for Replit Auth (ID: ${authId})`);
        } else if (user?.authId) {
          console.log(`✅ Admin account ${email} already linked to Replit Auth`);
        } else {
          console.log(`⚠️ Admin account ${email} not found - will be created on first login`);
        }
      } catch (error) {
        console.error(`Error linking admin account ${email}:`, error);
      }
    }
  }

  /**
   * Generate fallback auth IDs for users without Replit accounts
   * Uses email hash to create deterministic IDs
   */
  static generateFallbackAuthId(email: string): string {
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    return `fallback_${hash.substring(0, 16)}`;
  }

  /**
   * Migrate all existing users to have auth_id values
   * This prepares the database for Replit Auth integration
   */
  static async migrateExistingUsers(): Promise<{
    total: number;
    linked: number;
    failed: number;
  }> {
    console.log('🔄 Starting user migration to Replit Auth...');
    
    const stats = {
      total: 0,
      linked: 0,
      failed: 0
    };
    
    try {
      // Get all users without auth_id
      const result = await db.execute(
        sql`SELECT id, email, username FROM users WHERE auth_id IS NULL`
      );
      
      stats.total = result.rows.length;
      console.log(`Found ${stats.total} users to migrate`);
      
      for (const user of result.rows) {
        try {
          const email = (user.email || user.username) as string;
          
          if (!email) {
            console.warn(`User ${user.id} has no email, skipping`);
            stats.failed++;
            continue;
          }
          
          // Check if this is an admin account
          const isAdmin = this.ADMIN_AUTH_IDS[email.toLowerCase()];
          const authId = isAdmin || this.generateFallbackAuthId(email);
          
          // Update user with fallback auth_id
          await db.execute(
            sql`UPDATE users SET auth_id = ${authId} WHERE id = ${user.id}`
          );
          
          // Record in audit table
          await db.execute(
            sql`INSERT INTO replit_linked_accounts (user_id, auth_id, email, link_method, notes)
                VALUES (${user.id}, ${authId}, ${email}, 'auto_generated', 
                        'Fallback ID generated during migration - will be updated on first Replit login')`
          );
          
          stats.linked++;
          
          if (stats.linked % 10 === 0) {
            console.log(`Progress: ${stats.linked}/${stats.total} users migrated`);
          }
        } catch (error) {
          console.error(`Failed to migrate user ${user.id}:`, error);
          stats.failed++;
        }
      }
      
      console.log('✅ User migration completed:', stats);
      return stats;
      
    } catch (error) {
      console.error('Fatal error during user migration:', error);
      throw error;
    }
  }

  /**
   * Verify migration status and integrity
   */
  static async verifyMigration(): Promise<{
    totalUsers: number;
    withAuthId: number;
    withoutAuthId: number;
    adminsLinked: boolean;
  }> {
    const totalResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM users`
    );
    const totalUsers = parseInt(totalResult.rows[0].count as string);
    
    const withAuthResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM users WHERE auth_id IS NOT NULL`
    );
    const withAuthId = parseInt(withAuthResult.rows[0].count as string);
    
    const adminResult = await db.execute(
      sql`SELECT email, auth_id FROM users 
          WHERE email IN ('william.cowell01@gmail.com', 'admin@myseniorvalet.com')
          AND role = 'super_admin'`
    );
    
    const adminsLinked = adminResult.rows.length === 2 && 
                         adminResult.rows.every(row => row.auth_id !== null);
    
    const status = {
      totalUsers,
      withAuthId,
      withoutAuthId: totalUsers - withAuthId,
      adminsLinked
    };
    
    console.log('📊 Migration Status:', status);
    
    if (!adminsLinked) {
      console.warn('⚠️ WARNING: Admin accounts not properly linked!');
    }
    
    return status;
  }

  /**
   * Run the complete migration process
   */
  static async runMigration(): Promise<void> {
    console.log('🚀 Starting Replit Auth migration process...');
    
    try {
      // Step 1: Link admin accounts first (critical)
      await this.linkAdminAccounts();
      
      // Step 2: Migrate remaining users
      const migrationStats = await this.migrateExistingUsers();
      
      // Step 3: Verify migration
      const verificationStatus = await this.verifyMigration();
      
      if (!verificationStatus.adminsLinked) {
        throw new Error('Admin accounts migration failed - aborting');
      }
      
      console.log('✅ Replit Auth migration completed successfully!');
      console.log('📋 Summary:');
      console.log(`  - Total users: ${verificationStatus.totalUsers}`);
      console.log(`  - Migrated: ${verificationStatus.withAuthId}`);
      console.log(`  - Pending: ${verificationStatus.withoutAuthId}`);
      console.log(`  - Admin access: ${verificationStatus.adminsLinked ? '✅ Secured' : '❌ Failed'}`);
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

// Export for use in server initialization
export default ReplitAuthMigrationService;