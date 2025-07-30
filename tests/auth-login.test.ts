import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../server/db';
import { storage } from '../server/storage';
import { sql } from 'drizzle-orm';

describe('Authentication Login Test - SQL Fix Verification', () => {
  // Test user data
  const testUser = {
    id: 'test_user_' + Date.now(),
    email: 'test@myseniorvalet.com',
    username: 'test@myseniorvalet.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'replit_auth',
    role: 'user'
  };

  beforeAll(async () => {
    // Clean up any existing test user
    try {
      await db.execute(sql`DELETE FROM users WHERE email = ${testUser.email}`);
    } catch (error) {
      // Ignore if user doesn't exist
    }
  });

  afterAll(async () => {
    // Clean up test user
    try {
      await db.execute(sql`DELETE FROM users WHERE id = ${testUser.id}`);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create a new user successfully', async () => {
    const createdUser = await storage.createUser(testUser);
    
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBe(testUser.id);
    expect(createdUser.email).toBe(testUser.email);
    expect(createdUser.role).toBe(testUser.role);
  });

  it('should update user without SQL syntax errors', async () => {
    // Create user first
    await storage.createUser(testUser);
    
    // Test the updateUser function that was causing SQL errors
    const updates = {
      firstName: 'Updated',
      lastName: 'Name',
      email: testUser.email
    };
    
    const updatedUser = await storage.updateUser(testUser.id, updates);
    
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.firstName).toBe('Updated');
    expect(updatedUser?.lastName).toBe('Name');
  });

  it('should handle William Cowell super admin authentication', async () => {
    const williamUser = {
      id: 'william_test_' + Date.now(),
      email: 'William.cowell01@gmail.com',
      username: 'William.cowell01@gmail.com',
      firstName: 'William',
      lastName: 'Cowell',
      password: 'replit_auth',
      role: 'super_admin'
    };

    try {
      // Create William's user
      const createdUser = await storage.createUser(williamUser);
      
      expect(createdUser).toBeDefined();
      expect(createdUser.role).toBe('super_admin');
      
      // Test updating William's user (simulating Replit Auth update)
      const updatedUser = await storage.updateUser(williamUser.id, {
        firstName: 'William',
        lastName: 'Cowell'
      });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.role).toBe('super_admin');
      
      // Clean up
      await db.execute(sql`DELETE FROM users WHERE id = ${williamUser.id}`);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('should handle favorites table with new columns', async () => {
    // Create test user
    await storage.createUser(testUser);
    
    // Test inserting into favorites table with new columns
    try {
      const result = await db.execute(sql`
        INSERT INTO favorites (user_id, community_id, notes, tags, priority)
        VALUES (${parseInt(testUser.id.replace(/\D/g, '')) || 1}, 264, 'Test note', '{}', 'Medium')
        RETURNING *
      `);
      
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].notes).toBe('Test note');
      
      // Clean up
      await db.execute(sql`DELETE FROM favorites WHERE notes = 'Test note'`);
    } catch (error) {
      console.error('Favorites test error:', error);
      throw error;
    }
  });
});