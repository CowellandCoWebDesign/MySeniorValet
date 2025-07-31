import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Test user credentials
const testUser = {
  email: 'william.cowell01@gmail.com',
  password: 'MySeniorValet2025!'
};

async function testMessagingSystem() {
  console.log('🧪 Testing MySeniorValet Messaging System...\n');
  
  let sessionCookie = '';
  
  // 1. Test Authentication
  console.log('1️⃣ Testing Authentication...');
  try {
    const loginResponse = await fetch(`${API_BASE}/api/auth/quick-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (loginResponse.ok) {
      const setCookie = loginResponse.headers.get('set-cookie');
      if (setCookie) {
        sessionCookie = setCookie.split(';')[0];
      }
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.email);
    } else {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return;
  }
  
  // 2. Test Unread Messages Count
  console.log('\n2️⃣ Testing Unread Messages...');
  try {
    const unreadResponse = await fetch(`${API_BASE}/api/messaging/unread`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    if (unreadResponse.ok) {
      const unreadData = await unreadResponse.json();
      console.log('✅ Unread count:', unreadData.unreadCount || 0);
    } else {
      console.log('❌ Unread messages failed:', unreadResponse.status);
    }
  } catch (error) {
    console.log('❌ Unread messages error:', error.message);
  }
  
  // 3. Test Get Conversations
  console.log('\n3️⃣ Testing Get Conversations...');
  try {
    const conversationsResponse = await fetch(`${API_BASE}/api/messaging/conversations`, {
      headers: { 'Cookie': sessionCookie }
    });
    
    if (conversationsResponse.ok) {
      const conversations = await conversationsResponse.json();
      console.log('✅ Conversations found:', conversations.length);
      
      // If we have conversations, test getting messages from the first one
      if (conversations.length > 0) {
        const firstConversation = conversations[0];
        console.log(`   First conversation: ${firstConversation.communityName}`);
        
        // 4. Test Get Messages for a Conversation
        console.log('\n4️⃣ Testing Get Messages...');
        const messagesResponse = await fetch(`${API_BASE}/api/messaging/conversations/${firstConversation.id}/messages`, {
          headers: { 'Cookie': sessionCookie }
        });
        
        if (messagesResponse.ok) {
          const messages = await messagesResponse.json();
          console.log('✅ Messages in conversation:', messages.length);
        } else {
          console.log('❌ Get messages failed:', messagesResponse.status);
        }
      }
    } else {
      console.log('❌ Get conversations failed:', conversationsResponse.status);
    }
  } catch (error) {
    console.log('❌ Get conversations error:', error.message);
  }
  
  // 5. Test Create New Conversation
  console.log('\n5️⃣ Testing Create New Conversation...');
  try {
    const testCommunityId = 264; // Heritage Hills (from trending communities)
    const testMessage = {
      communityId: testCommunityId,
      message: 'Hello, I would like to learn more about your community.'
    };
    
    const createResponse = await fetch(`${API_BASE}/api/messaging/conversations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify(testMessage)
    });
    
    if (createResponse.ok) {
      const newConversation = await createResponse.json();
      console.log('✅ New conversation created with ID:', newConversation.conversationId);
      
      // 6. Test Sending a Follow-up Message
      console.log('\n6️⃣ Testing Send Follow-up Message...');
      const followUpMessage = {
        message: 'Specifically, I am interested in your memory care services.'
      };
      
      const sendResponse = await fetch(`${API_BASE}/api/messaging/conversations/${newConversation.conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': sessionCookie 
        },
        body: JSON.stringify(followUpMessage)
      });
      
      if (sendResponse.ok) {
        const sentMessage = await sendResponse.json();
        console.log('✅ Follow-up message sent:', sentMessage.message.content.substring(0, 50) + '...');
      } else {
        console.log('❌ Send follow-up message failed:', sendResponse.status);
      }
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Create conversation failed:', createResponse.status, errorText);
    }
  } catch (error) {
    console.log('❌ Create conversation error:', error.message);
  }
  
  console.log('\n🎯 Messaging System Test Complete!');
}

// Run the tests
testMessagingSystem().catch(console.error);