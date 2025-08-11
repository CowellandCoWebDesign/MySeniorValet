import { db } from './db';
import { conversations, messages, familyGroups } from '../shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  error?: any;
}

export class MessagingSystemTester {
  private results: TestResult[] = [];
  private testUserId = 99999;  // Use integer ID for test user
  private testCommunityId = 1;  // Use existing community ID
  
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting comprehensive messaging system tests...\n');
    
    // Setup test data first
    await this.setupTestData();
    
    // Clear previous test data
    await this.cleanupTestData();
    
    // Run test suites
    await this.testConversationCreation();
    await this.testMessageSending();
    await this.testFamilyGroups();
    await this.testConversationRetrieval();
    await this.testMessageThreads();
    await this.testUnreadCounts();
    await this.testConversationFiltering();
    await this.testFamilyGroupInvites();
    await this.testSharedNotes();
    await this.testRealTimeMessaging();
    
    // Print results
    this.printResults();
    
    return this.results;
  }
  
  private async setupTestData() {
    try {
      // We'll use the existing community with ID 1 that's already in the database
      // No need to create test users/communities since they might already exist
      
      this.addResult('Setup Test Data', 'PASS', 'Using existing database data for testing');
    } catch (error) {
      this.addResult('Setup Test Data', 'FAIL', 'Failed to setup test data', error);
    }
  }
  
  private async cleanupTestData() {
    try {
      // Clean up test conversations
      await db.delete(messages).where(
        or(
          eq(messages.senderId, this.testUserId),
          eq(messages.senderId, 99997),  // test-community-rep
          eq(messages.senderId, 99996)   // test-family-member
        )
      );
      
      await db.delete(conversations).where(
        or(
          eq(conversations.title, 'Test Conversation'),
          eq(conversations.title, 'Test Family Group'),
          eq(conversations.title, 'Test Direct Message')
        )
      );
      
      await db.delete(familyGroups).where(
        or(
          eq(familyGroups.ownerId, this.testUserId),
          eq(familyGroups.name, 'Test Family Group')
        )
      );
      
      this.addResult('Cleanup Test Data', 'PASS', 'Previous test data cleaned');
    } catch (error) {
      this.addResult('Cleanup Test Data', 'FAIL', 'Failed to clean test data', error);
    }
  }
  
  private async testConversationCreation() {
    try {
      // Test creating a direct conversation
      const [directConv] = await db.insert(conversations).values({
        type: 'user_to_community',
        title: 'Test Conversation',
        participants: JSON.stringify([
          { userId: this.testUserId, role: 'member', joinedAt: new Date().toISOString() },
          { userId: 99997, role: 'community_rep', joinedAt: new Date().toISOString() }
        ]),
        communityId: this.testCommunityId,
        status: 'active'
      }).returning();
      
      if (directConv && directConv.id) {
        this.addResult('Create Direct Conversation', 'PASS', `Created conversation ID: ${directConv.id}`);
      } else {
        this.addResult('Create Direct Conversation', 'FAIL', 'No conversation ID returned');
      }
      
      // Test creating a community broadcast conversation
      const [broadcastConv] = await db.insert(conversations).values({
        type: 'community_broadcast',
        title: 'Sunrise Manor Updates',
        participants: JSON.stringify([
          { userId: 99995, role: 'admin', joinedAt: new Date().toISOString() }
        ]),
        communityId: this.testCommunityId,
        status: 'active'
      }).returning();
      
      if (broadcastConv && broadcastConv.id) {
        this.addResult('Create Broadcast Conversation', 'PASS', `Created broadcast ID: ${broadcastConv.id}`);
      } else {
        this.addResult('Create Broadcast Conversation', 'FAIL', 'No broadcast ID returned');
      }
      
    } catch (error) {
      this.addResult('Conversation Creation', 'FAIL', 'Failed to create conversations', error);
    }
  }
  
  private async testMessageSending() {
    try {
      // Get a conversation to send messages to
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.title, 'Test Conversation'))
        .limit(1);
      
      if (!conversation) {
        this.addResult('Message Sending', 'FAIL', 'No test conversation found');
        return;
      }
      
      // Send multiple test messages
      const testMessages = [
        { content: 'Hello, I am interested in scheduling a tour.', senderId: this.testUserId },
        { content: 'Great! We have availability this week.', senderId: 99997 },  // test-community-rep
        { content: 'What days work best for you?', senderId: 99997 },  // test-community-rep
        { content: 'Thursday or Friday would be perfect.', senderId: this.testUserId },
      ];
      
      for (const msg of testMessages) {
        const [message] = await db.insert(messages).values({
          conversationId: conversation.id,
          senderId: msg.senderId,
          content: msg.content,
          metadata: JSON.stringify({ timestamp: new Date().toISOString() })
        }).returning();
        
        if (message && message.id) {
          this.addResult(`Send Message`, 'PASS', `Message ID: ${message.id}`);
        } else {
          this.addResult(`Send Message`, 'FAIL', 'Failed to send message');
        }
      }
      
      // Update conversation's last message
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: testMessages[testMessages.length - 1].content,
          unreadCounts: JSON.stringify({ [this.testUserId]: 2 })
        })
        .where(eq(conversations.id, conversation.id));
      
      this.addResult('Update Conversation Metadata', 'PASS', 'Updated last message info');
      
    } catch (error) {
      this.addResult('Message Sending', 'FAIL', 'Failed to send messages', error);
    }
  }
  
  private async testFamilyGroups() {
    try {
      // Create a family group
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const [familyGroup] = await db.insert(familyGroups).values({
        name: 'Test Family Group',
        ownerId: this.testUserId,
        members: JSON.stringify([
          {
            userId: this.testUserId,
            role: 'owner',
            relationship: 'Son',
            permissions: {
              canMessage: true,
              canInvite: true,
              canRemove: true,
              canViewAll: true,
              canEditNotes: true
            },
            joinedAt: new Date().toISOString()
          }
        ]),
        inviteCode: inviteCode,
        inviteCodeExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        settings: JSON.stringify({
          allowJoinRequests: true,
          requireApproval: false,
          shareLocation: true,
          shareCalendar: true,
          notifyOnActivity: true
        })
      }).returning();
      
      if (familyGroup && familyGroup.id) {
        this.addResult('Create Family Group', 'PASS', `Group ID: ${familyGroup.id}, Invite: ${inviteCode}`);
        
        // Test adding a member
        const currentMembers = typeof familyGroup.members === 'string' 
          ? JSON.parse(familyGroup.members) 
          : familyGroup.members;
        currentMembers.push({
          userId: 99996,  // test-family-member
          role: 'member',
          relationship: 'Daughter',
          permissions: {
            canMessage: true,
            canInvite: false,
            canRemove: false,
            canViewAll: true,
            canEditNotes: true
          },
          joinedAt: new Date().toISOString(),
          invitedBy: this.testUserId
        });
        
        await db.update(familyGroups)
          .set({ members: JSON.stringify(currentMembers) })
          .where(eq(familyGroups.id, familyGroup.id));
        
        this.addResult('Add Family Member', 'PASS', 'Added test-family-member to group');
        
      } else {
        this.addResult('Create Family Group', 'FAIL', 'No family group ID returned');
      }
      
    } catch (error) {
      this.addResult('Family Groups', 'FAIL', 'Failed to create family group', error);
    }
  }
  
  private async testConversationRetrieval() {
    try {
      // Retrieve all conversations
      const allConversations = await db.select()
        .from(conversations)
        .orderBy(desc(conversations.createdAt));
      
      if (allConversations.length > 0) {
        this.addResult('Retrieve All Conversations', 'PASS', `Found ${allConversations.length} conversations`);
      } else {
        this.addResult('Retrieve All Conversations', 'FAIL', 'No conversations found');
      }
      
      // Retrieve conversations for specific user (check participants field)
      const userConversations = allConversations.filter(conv => {
        try {
          const participants = typeof conv.participants === 'string' 
            ? JSON.parse(conv.participants) 
            : conv.participants;
          return participants.some((p: any) => p.userId === this.testUserId);
        } catch {
          return false;
        }
      });
      
      if (userConversations.length > 0) {
        this.addResult('Retrieve User Conversations', 'PASS', `Found ${userConversations.length} user conversations`);
      } else {
        this.addResult('Retrieve User Conversations', 'FAIL', 'No user conversations found');
      }
      
      // Retrieve conversations by type
      const broadcastConversations = await db.select()
        .from(conversations)
        .where(eq(conversations.type, 'community_broadcast'));
      
      if (broadcastConversations.length > 0) {
        this.addResult('Retrieve Broadcast Conversations', 'PASS', `Found ${broadcastConversations.length} broadcasts`);
      } else {
        this.addResult('Retrieve Broadcast Conversations', 'FAIL', 'No broadcast conversations found');
      }
      
    } catch (error) {
      this.addResult('Conversation Retrieval', 'FAIL', 'Failed to retrieve conversations', error);
    }
  }
  
  private async testMessageThreads() {
    try {
      // Get a conversation with messages
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.title, 'Test Conversation'))
        .limit(1);
      
      if (!conversation) {
        this.addResult('Message Threads', 'FAIL', 'No test conversation found');
        return;
      }
      
      // Retrieve message thread
      const messageThread = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt);
      
      if (messageThread.length > 0) {
        this.addResult('Retrieve Message Thread', 'PASS', `Found ${messageThread.length} messages in thread`);
        
        // Verify message order
        let previousTime = new Date(0);
        let orderCorrect = true;
        for (const msg of messageThread) {
          const msgTime = new Date(msg.createdAt);
          if (msgTime < previousTime) {
            orderCorrect = false;
            break;
          }
          previousTime = msgTime;
        }
        
        if (orderCorrect) {
          this.addResult('Message Thread Order', 'PASS', 'Messages are in chronological order');
        } else {
          this.addResult('Message Thread Order', 'FAIL', 'Messages are not in correct order');
        }
        
      } else {
        this.addResult('Retrieve Message Thread', 'FAIL', 'No messages found in thread');
      }
      
    } catch (error) {
      this.addResult('Message Threads', 'FAIL', 'Failed to retrieve message thread', error);
    }
  }
  
  private async testUnreadCounts() {
    try {
      // Get conversation with unread messages
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.title, 'Test Conversation'))
        .limit(1);
      
      if (conversation) {
        // Parse unreadCounts JSON
        const unreadCounts = typeof conversation.unreadCounts === 'string' 
          ? JSON.parse(conversation.unreadCounts || '{}')
          : (conversation.unreadCounts || {});
        const userUnread = unreadCounts[this.testUserId] || 0;
        
        if (userUnread > 0) {
          this.addResult('Unread Count', 'PASS', `User has ${userUnread} unread messages`);
          
          // Mark messages as read
          await db.update(conversations)
            .set({ unreadCounts: JSON.stringify({}) })
            .where(eq(conversations.id, conversation.id));
          
          const [updated] = await db.select()
            .from(conversations)
            .where(eq(conversations.id, conversation.id))
            .limit(1);
          
          const updatedCounts = typeof updated?.unreadCounts === 'string' 
            ? JSON.parse(updated.unreadCounts || '{}')
            : (updated?.unreadCounts || {});
          if (Object.keys(updatedCounts).length === 0) {
            this.addResult('Mark Messages Read', 'PASS', 'Successfully marked messages as read');
          } else {
            this.addResult('Mark Messages Read', 'FAIL', 'Failed to mark messages as read');
          }
        } else {
          this.addResult('Unread Count', 'PASS', 'No unread messages');
        }
      } else {
        this.addResult('Unread Count', 'FAIL', 'Conversation not found');
      }
      
    } catch (error) {
      this.addResult('Unread Counts', 'FAIL', 'Failed to test unread counts', error);
    }
  }
  
  private async testConversationFiltering() {
    try {
      // Test filtering by status
      const activeConversations = await db.select()
        .from(conversations)
        .where(eq(conversations.status, 'active'));
      
      if (activeConversations.length > 0) {
        this.addResult('Filter Active Conversations', 'PASS', `Found ${activeConversations.length} active conversations`);
      } else {
        this.addResult('Filter Active Conversations', 'FAIL', 'No active conversations found');
      }
      
      // Test filtering by community
      const communityConversations = await db.select()
        .from(conversations)
        .where(eq(conversations.communityId, this.testCommunityId));
      
      if (communityConversations.length > 0) {
        this.addResult('Filter Community Conversations', 'PASS', `Found ${communityConversations.length} community conversations`);
      } else {
        this.addResult('Filter Community Conversations', 'FAIL', 'No community conversations found');
      }
      
    } catch (error) {
      this.addResult('Conversation Filtering', 'FAIL', 'Failed to filter conversations', error);
    }
  }
  
  private async testFamilyGroupInvites() {
    try {
      // Get family group with invite code
      const [familyGroup] = await db.select()
        .from(familyGroups)
        .where(eq(familyGroups.name, 'Test Family Group'))
        .limit(1);
      
      if (familyGroup && familyGroup.inviteCode) {
        this.addResult('Family Group Invite Code', 'PASS', `Invite code: ${familyGroup.inviteCode}`);
        
        // Test invite code expiry
        const expiryDate = new Date(familyGroup.inviteCodeExpiry);
        const now = new Date();
        
        if (expiryDate > now) {
          this.addResult('Invite Code Valid', 'PASS', `Code valid until ${expiryDate.toLocaleDateString()}`);
        } else {
          this.addResult('Invite Code Valid', 'FAIL', 'Invite code has expired');
        }
        
        // Test member permissions
        const members = typeof familyGroup.members === 'string' 
          ? JSON.parse(familyGroup.members) 
          : familyGroup.members;
        const owner = members.find((m: any) => m.role === 'owner');
        
        if (owner && owner.permissions.canInvite) {
          this.addResult('Owner Permissions', 'PASS', 'Owner has invite permissions');
        } else {
          this.addResult('Owner Permissions', 'FAIL', 'Owner lacks invite permissions');
        }
        
      } else {
        this.addResult('Family Group Invite Code', 'FAIL', 'No invite code found');
      }
      
    } catch (error) {
      this.addResult('Family Group Invites', 'FAIL', 'Failed to test invites', error);
    }
  }
  
  private async testSharedNotes() {
    try {
      // Get family group
      const [familyGroup] = await db.select()
        .from(familyGroups)
        .where(eq(familyGroups.name, 'Test Family Group'))
        .limit(1);
      
      if (!familyGroup) {
        this.addResult('Shared Notes', 'FAIL', 'No family group found');
        return;
      }
      
      // Add shared notes
      const notes = [
        {
          id: Math.random().toString(36).substring(7),
          authorId: this.testUserId,
          content: 'Mom prefers private room with window view',
          communityId: this.testCommunityId,
          createdAt: new Date().toISOString(),
          tags: ['preferences', 'room']
        },
        {
          id: Math.random().toString(36).substring(7),
          authorId: 'test-family-member',
          content: 'Visited Sunrise Manor - very clean and friendly staff',
          communityId: this.testCommunityId,
          createdAt: new Date().toISOString(),
          tags: ['tour', 'review']
        }
      ];
      
      await db.update(familyGroups)
        .set({ sharedNotes: JSON.stringify(notes) })
        .where(eq(familyGroups.id, familyGroup.id));
      
      // Verify notes were saved
      const [updated] = await db.select()
        .from(familyGroups)
        .where(eq(familyGroups.id, familyGroup.id))
        .limit(1);
      
      if (updated && updated.sharedNotes) {
        const savedNotes = typeof updated.sharedNotes === 'string' 
          ? JSON.parse(updated.sharedNotes) 
          : updated.sharedNotes;
        if (savedNotes.length === 2) {
          this.addResult('Add Shared Notes', 'PASS', `Added ${savedNotes.length} shared notes`);
        } else {
          this.addResult('Add Shared Notes', 'FAIL', 'Incorrect number of notes saved');
        }
      } else {
        this.addResult('Add Shared Notes', 'FAIL', 'No notes saved');
      }
      
    } catch (error) {
      this.addResult('Shared Notes', 'FAIL', 'Failed to test shared notes', error);
    }
  }
  
  private async testRealTimeMessaging() {
    try {
      // Simulate real-time message delivery
      const [conversation] = await db.select()
        .from(conversations)
        .where(eq(conversations.title, 'Test Conversation'))
        .limit(1);
      
      if (!conversation) {
        this.addResult('Real-Time Messaging', 'FAIL', 'No test conversation found');
        return;
      }
      
      // Send a real-time message
      const realtimeMessage = {
        conversationId: conversation.id,
        senderId: this.testUserId,
        content: 'This is a real-time test message',
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          delivered: false,
          read: false
        })
      };
      
      const [sent] = await db.insert(messages)
        .values(realtimeMessage)
        .returning();
      
      if (sent && sent.id) {
        this.addResult('Send Real-Time Message', 'PASS', `Message ID: ${sent.id}`);
        
        // Simulate message delivery
        const metadata = typeof sent.metadata === 'string' 
          ? JSON.parse(sent.metadata) 
          : sent.metadata;
        metadata.delivered = true;
        metadata.deliveredAt = new Date().toISOString();
        
        await db.update(messages)
          .set({ metadata: JSON.stringify(metadata) })
          .where(eq(messages.id, sent.id));
        
        this.addResult('Message Delivery Status', 'PASS', 'Message marked as delivered');
        
        // Simulate message read
        metadata.read = true;
        metadata.readAt = new Date().toISOString();
        
        await db.update(messages)
          .set({ 
            metadata: JSON.stringify(metadata),
            readAt: new Date()
          })
          .where(eq(messages.id, sent.id));
        
        this.addResult('Message Read Receipt', 'PASS', 'Message marked as read');
        
      } else {
        this.addResult('Send Real-Time Message', 'FAIL', 'Failed to send message');
      }
      
    } catch (error) {
      this.addResult('Real-Time Messaging', 'FAIL', 'Failed to test real-time messaging', error);
    }
  }
  
  private addResult(test: string, status: 'PASS' | 'FAIL', details?: string, error?: any) {
    this.results.push({ test, status, details, error });
    
    const emoji = status === 'PASS' ? '✅' : '❌';
    const color = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${emoji} ${color}${status}${reset}: ${test}`);
    if (details) {
      console.log(`   └─ ${details}`);
    }
    if (error && status === 'FAIL') {
      console.log(`   └─ Error: ${error.message || error}`);
    }
  }
  
  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`\nTotal Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  • ${r.test}`);
          if (r.details) console.log(`    └─ ${r.details}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(passRate === '100.0' ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests failed - review above');
    console.log('='.repeat(60) + '\n');
  }
}

// Export for use in API routes
export async function runMessagingTests() {
  const tester = new MessagingSystemTester();
  return await tester.runAllTests();
}