import { messagingService } from "./messaging-service";
import { db } from "./db";
import { conversations, users, communities } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testEmailNotifications() {
  console.log("🚀 Starting Email Notification Test...\n");

  try {
    // 1. Get test users
    console.log("📋 Getting test users...");
    const [testUser1] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName
    })
      .from(users)
      .where(eq(users.email, "william.cowell01@gmail.com"));
    
    const [testUser2] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName
    })
      .from(users)
      .where(eq(users.email, "hello@myseniorvalet.com"));

    if (!testUser1) {
      console.log("⚠️ Test user 1 not found. Creating test data...");
      return;
    }

    const user2Id = testUser2?.id || "test-user-2";
    console.log(`✅ Found users: ${testUser1.email} and ${user2Id}`);

    // 2. Create a test conversation
    console.log("\n📝 Creating test conversation...");
    const conversation = await messagingService.createConversation({
      type: 'user_to_user',
      title: 'Email Notification Test',
      participants: [
        { 
          userId: testUser1.id, 
          role: 'member', 
          joinedAt: new Date().toISOString(), 
          notifications: true 
        },
        { 
          userId: user2Id, 
          role: 'member', 
          joinedAt: new Date().toISOString(), 
          notifications: true 
        }
      ]
    });
    console.log(`✅ Created conversation #${conversation.id}`);

    // 3. Send a test message using the sendMessage function
    console.log("\n📧 Sending test message with email notification...");
    const message = await messagingService.sendMessage({
      conversationId: conversation.id,
      senderId: testUser1.id,
      senderType: 'user',
      content: 'This is a test message to verify email notifications are working correctly.',
      messageType: 'text'
    });
    console.log(`✅ Message sent with ID #${message.id}`);

    // 4. Test community conversation
    console.log("\n🏢 Testing community conversation...");
    const [testCommunity] = await db.select()
      .from(communities)
      .limit(1);

    if (testCommunity) {
      const communityConversation = await messagingService.createConversation({
        type: 'user_to_community',
        title: `Chat with ${testCommunity.name}`,
        participants: [
          { 
            userId: testUser1.id, 
            role: 'member', 
            joinedAt: new Date().toISOString(), 
            notifications: true 
          },
          { 
            userId: `community_${testCommunity.id}`, 
            role: 'community_rep', 
            joinedAt: new Date().toISOString(), 
            notifications: true 
          }
        ],
        communityId: testCommunity.id
      });
      console.log(`✅ Created community conversation #${communityConversation.id}`);

      // Send message from user to community
      const communityMessage = await messagingService.sendMessage({
        conversationId: communityConversation.id,
        senderId: testUser1.id,
        senderType: 'user',
        content: 'Hello, I would like more information about your community.',
        messageType: 'text'
      });
      console.log(`✅ Sent message to community with ID #${communityMessage.id}`);
    }

    console.log("\n✨ Email Notification Test Complete!");
    console.log("📌 Check the following email addresses for notifications:");
    console.log(`   - ${testUser1.email}`);
    if (testUser2) {
      console.log(`   - ${testUser2.email}`);
    }
    if (testCommunity) {
      console.log(`   - ${testCommunity.email || 'Community email not set'}`);
    }
    console.log("\n💡 If emails were sent successfully, you should see SendGrid logs above.");
    console.log("   If not, check that SENDGRID_API_KEY is configured correctly.\n");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  process.exit(0);
}

// Run the test
testEmailNotifications();