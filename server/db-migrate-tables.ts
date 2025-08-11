import { db } from './db';
import { sql } from 'drizzle-orm';

async function createCommunicationTables() {
  console.log('Creating communication tables...');
  
  try {
    // Create wsConnections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ws_connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        socket_id VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        device_type VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent TEXT,
        last_heartbeat TIMESTAMP DEFAULT NOW(),
        connected_at TIMESTAMP DEFAULT NOW(),
        disconnected_at TIMESTAMP
      )
    `);
    
    // Create indexes for wsConnections
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ws_connections_user_idx ON ws_connections(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ws_connections_status_idx ON ws_connections(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS ws_connections_heartbeat_idx ON ws_connections(last_heartbeat)`);
    
    console.log('✅ Created ws_connections table');
    
    // Create familyInvitations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS family_invitations (
        id SERIAL PRIMARY KEY,
        inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitee_email VARCHAR(255) NOT NULL,
        invitee_phone VARCHAR(20),
        invitee_name VARCHAR(255),
        invitee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        invitation_token VARCHAR(255) NOT NULL UNIQUE,
        relationship VARCHAR(100),
        message TEXT,
        share_preferences JSONB DEFAULT '{"communities": true, "notes": true, "documents": false, "tours": true, "messages": true}',
        status VARCHAR(50) DEFAULT 'pending',
        accepted_at TIMESTAMP,
        declined_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        sent_via VARCHAR(50) DEFAULT 'email',
        reminder_count INTEGER DEFAULT 0,
        last_reminder_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes for familyInvitations
    await db.execute(sql`CREATE INDEX IF NOT EXISTS family_invitations_inviter_idx ON family_invitations(inviter_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS family_invitations_invitee_email_idx ON family_invitations(invitee_email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS family_invitations_token_idx ON family_invitations(invitation_token)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS family_invitations_status_idx ON family_invitations(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS family_invitations_expires_idx ON family_invitations(expires_at)`);
    
    console.log('✅ Created family_invitations table');
    
    console.log('\n✨ All communication tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createCommunicationTables().then(() => {
  console.log('\n🎉 Database migration completed!');
  process.exit(0);
}).catch(console.error);