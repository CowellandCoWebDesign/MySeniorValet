# MySeniorValet Messaging API Documentation

## Overview
The MySeniorValet messaging system provides real-time communication between users, families, and senior living communities with automatic email notifications for new messages.

## Authentication
All messaging endpoints require authentication. Users must be logged in to access messaging features.

## Base URL
```
https://your-domain.com/api/messaging
```

## Endpoints

### 1. Send Message to Conversation
**POST** `/api/messaging/conversations/:conversationId/messages`

Send a new message to an existing conversation with automatic email notifications to all participants.

#### Request Parameters
- **conversationId** (URL parameter) - The ID of the conversation

#### Request Body
```json
{
  "senderId": "123",           // ID of the sender (user or community ID)
  "senderType": "user",        // Type: "user" or "community"
  "content": "Hello!",         // Message content
  "messageType": "text",       // Optional: "text" (default), "image", "document"
  "attachments": [],           // Optional: Array of attachment URLs
  "metadata": {}               // Optional: Additional metadata
}
```

#### Response
```json
{
  "id": 1,
  "conversationId": 10,
  "senderId": "123",
  "senderType": "user",
  "content": "Hello!",
  "messageType": "text",
  "attachments": null,
  "metadata": null,
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-08-11T18:00:00.000Z",
  "updatedAt": "2025-08-11T18:00:00.000Z",
  "sender": {
    "id": "123",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": null
  }
}
```

#### Email Notifications
When a message is sent:
- All conversation participants (except the sender) receive email notifications
- Emails include sender name, message preview, and a link to the conversation
- Notifications respect each participant's notification preferences

### 2. Get Conversations
**GET** `/api/messaging/conversations`

Retrieve all conversations for the authenticated user.

#### Query Parameters
- **userId** - Required: The user's ID
- **limit** - Optional: Number of conversations to return (default: 20)
- **offset** - Optional: Pagination offset (default: 0)

#### Response
```json
[
  {
    "id": 1,
    "type": "user_to_user",
    "title": "Chat with John",
    "participants": [...],
    "lastMessageAt": "2025-08-11T18:00:00.000Z",
    "lastMessagePreview": "Hello!",
    "unreadCount": 2
  }
]
```

### 3. Get Messages in Conversation
**GET** `/api/messaging/conversations/:conversationId/messages`

Retrieve messages from a specific conversation.

#### Query Parameters
- **limit** - Optional: Number of messages to return (default: 50)
- **offset** - Optional: Pagination offset (default: 0)

#### Response
```json
[
  {
    "id": 1,
    "conversationId": 10,
    "senderId": "123",
    "senderType": "user",
    "content": "Hello!",
    "createdAt": "2025-08-11T18:00:00.000Z",
    "sender": {
      "id": "123",
      "firstName": "John",
      "lastName": "Doe",
      "profileImageUrl": null
    }
  }
]
```

### 4. Create New Conversation
**POST** `/api/messaging/conversations`

Create a new conversation between users.

#### Request Body
```json
{
  "type": "user_to_user",
  "title": "New Chat",
  "participants": [
    {
      "userId": "123",
      "role": "member",
      "notifications": true
    },
    {
      "userId": "456",
      "role": "member",
      "notifications": true
    }
  ]
}
```

### 5. Create Community Conversation
**POST** `/api/messaging/conversations/community`

Start a conversation with a senior living community.

#### Request Body
```json
{
  "userId": "123",
  "communityId": 789,
  "initialMessage": "I'm interested in learning more about your community."
}
```

## WebSocket Connection

### Connect to WebSocket
```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    payload: { userId: '123' }
  }));
  
  // Join conversations
  ws.send(JSON.stringify({
    type: 'join_conversation',
    payload: { conversationId: 10 }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'new_message') {
    // Handle new message
    console.log('New message:', message.payload);
  }
};
```

## Email Notification Templates

### New Message Notification
Recipients receive an HTML email with:
- Sender's name and profile image (if available)
- Message preview (first 100 characters)
- Conversation title
- Direct link to view the full conversation
- Option to disable notifications

### Community Message Notification
When a community receives a message:
- Email sent to community's primary contact email
- Includes user's name and inquiry
- Link to community dashboard to respond

## Error Responses

### 400 Bad Request
```json
{
  "error": "Sender ID, sender type, and content are required"
}
```

### 404 Not Found
```json
{
  "error": "Conversation not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to send message"
}
```

## Rate Limiting
- Maximum 100 messages per minute per user
- Maximum 10 new conversations per hour per user

## Best Practices

1. **Message Content**: Keep messages under 5000 characters
2. **Attachments**: Upload files to object storage first, then include URLs
3. **Notification Preferences**: Respect user preferences for email notifications
4. **Error Handling**: Implement retry logic for failed message sends
5. **Real-time Updates**: Use WebSocket for instant message delivery

## Testing

Use the test script to verify email notifications:
```bash
cd server && npx tsx test-email-notifications.ts
```

This will:
1. Create test conversations
2. Send test messages
3. Verify email notifications are sent
4. Output results to console

## Security Considerations

1. **Authentication**: All endpoints require valid user authentication
2. **Authorization**: Users can only access their own conversations
3. **Input Validation**: All input is validated and sanitized
4. **Rate Limiting**: Prevents spam and abuse
5. **Email Verification**: Only verified email addresses receive notifications

---

## Support
For questions or issues with the messaging API, contact: hello@myseniorvalet.com