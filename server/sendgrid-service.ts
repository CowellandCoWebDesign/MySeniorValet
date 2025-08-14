import sgMail from '@sendgrid/mail';
import { db } from './db';
import { users, communities, conversations } from '@shared/schema';
import { eq } from 'drizzle-orm';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid configured for email notifications');
} else {
  console.warn('⚠️ SendGrid API key not configured - email notifications disabled');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

interface MessageNotificationParams {
  recipientId: string;
  recipientType: 'user' | 'community';
  conversationId: number;
  messageContent: string;
  senderName: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log(`Sending email to ${params.to}: ${params.subject}`);
    
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || params.text || ''
    };

    const [response] = await sgMail.send(msg);
    
    console.log(`Email sent successfully. Status: ${response.statusCode}`);
    return response.statusCode >= 200 && response.statusCode < 300;

  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
}

// Super admin notification specifically
export async function notifySuperAdmin(title: string, message: string, data?: any) {
  // Send to both William and admin@myseniorvalet.com
  const recipients = ['William.cowell01@gmail.com', 'admin@myseniorvalet.com'];
  
  for (const recipient of recipients) {
    await sendEmail({
      to: recipient,
      from: 'hello@myseniorvalet.com',
      subject: `MySeniorValet Alert: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">${title}</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>${message}</p>
            ${data ? `<pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>` : ''}
          </div>
          <p style="color: #6b7280; font-size: 12px;">MySeniorValet System - ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `${title}\n\n${message}\n\n${data ? JSON.stringify(data, null, 2) : ''}`
    });
  }
  return true;
}

// New customer notification
export async function notifyNewCustomer(customerType: 'community' | 'vendor', customerData: any) {
  const title = customerType === 'community' 
    ? '🎉 New Community Registration!'
    : '🎉 New Vendor Registration!';
  
  const message = customerType === 'community'
    ? `A new community has registered on MySeniorValet!`
    : `A new vendor has registered on MySeniorValet!`;
  
  return await sendEmail({
    to: 'admin@myseniorvalet.com',
    from: 'hello@myseniorvalet.com',
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">${title}</h2>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
          <p style="font-size: 16px; color: #1f2937;">${message}</p>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #065f46;">Customer Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;">${customerData.name || customerData.business_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;">${customerData.email || customerData.primary_contact_email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;"><strong>Location:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;">${customerData.city}, ${customerData.state}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;"><strong>Subscription:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #d1d5db;">${customerData.subscription_tier || 'Unclaimed'}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 6px;">
            <p style="margin: 0; font-weight: bold; color: #065f46;">Next Steps:</p>
            <ul style="margin: 10px 0; color: #374151;">
              <li>Review the new registration</li>
              <li>Reach out to welcome them</li>
              <li>Help them claim and upgrade their listing</li>
            </ul>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 12px;">
          MySeniorValet Platform<br/>
          ${new Date().toLocaleString()}<br/>
          Customer ID: ${customerData.id}
        </p>
      </div>
    `,
    text: `${title}\n\n${message}\n\nCustomer: ${customerData.name || customerData.business_name}\nEmail: ${customerData.email || customerData.primary_contact_email}\nLocation: ${customerData.city}, ${customerData.state}`
  });
}

// Message notification for messaging system
export async function sendMessageNotification(params: MessageNotificationParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email notifications disabled - no SendGrid API key');
    return false;
  }
  
  try {
    // Get recipient email
    const recipientEmail = await getRecipientEmail(params.recipientId, params.recipientType);
    
    if (!recipientEmail) {
      console.log(`No email found for ${params.recipientType} ${params.recipientId}`);
      return false;
    }
    
    // Check notification preferences
    const notificationsEnabled = await checkNotificationPreferences(
      params.recipientId, 
      params.recipientType
    );
    
    if (!notificationsEnabled) {
      console.log(`Email notifications disabled for ${params.recipientType} ${params.recipientId}`);
      return false;
    }
    
    // Get conversation details
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, params.conversationId))
      .limit(1);
    
    if (!conversation) {
      console.log('Conversation not found');
      return false;
    }
    
    // Prepare and send email
    const dashboardUrl = params.recipientType === 'user' 
      ? 'https://myseniorvalet.com/dashboard/messages'
      : 'https://myseniorvalet.com/community-dashboard/messages';
    
    const emailSent = await sendEmail({
      to: recipientEmail,
      from: 'hello@myseniorvalet.com',
      subject: `New message from ${params.senderName} on MySeniorValet`,
      text: `
New Message on MySeniorValet

You have received a new message from ${params.senderName}

Conversation: ${conversation.title}

Message:
${params.messageContent}

View and reply to this message at: ${dashboardUrl}

---
The trusted platform for authentic senior living community information.
To manage your email preferences, visit your dashboard settings.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 0 0 10px 10px;
    }
    .message-box {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">New Message on MySeniorValet</h1>
  </div>
  
  <div class="content">
    <p>Hello,</p>
    
    <p>You have received a new message from <strong>${params.senderName}</strong></p>
    
    <p><strong>Conversation:</strong> ${conversation.title}</p>
    
    <div class="message-box">
      <p style="margin: 0;">${params.messageContent}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${dashboardUrl}" class="button">View Message & Reply</a>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>MySeniorValet</strong><br>
    The trusted platform for authentic senior living community information.</p>
    <p>To manage your email preferences, visit your dashboard settings.</p>
  </div>
</body>
</html>
      `.trim()
    });
    
    if (emailSent) {
      console.log(`✅ Message notification sent to ${recipientEmail}`);
    }
    
    return emailSent;
    
  } catch (error) {
    console.error('Failed to send message notification:', error);
    return false;
  }
}

// Helper function to get recipient email
async function getRecipientEmail(recipientId: string, recipientType: 'user' | 'community'): Promise<string | null> {
  try {
    if (recipientType === 'user') {
      // Convert string ID to integer for users table
      const userId = parseInt(recipientId);
      if (isNaN(userId)) return null;
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      return user?.email || null;
    } else {
      // Communities use string IDs
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, recipientId))
        .limit(1);
      
      // Get contact email from community
      const emails = community?.emails as any;
      if (emails && typeof emails === 'object') {
        return emails.contact || emails.primary || null;
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting recipient email:', error);
    return null;
  }
}

// Helper function to check notification preferences
async function checkNotificationPreferences(recipientId: string, recipientType: 'user' | 'community'): Promise<boolean> {
  try {
    if (recipientType === 'user') {
      const userId = parseInt(recipientId);
      if (isNaN(userId)) return false;
      
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      // Check user preferences (default to true if not set)
      const preferences = user?.preferences as any;
      if (preferences && typeof preferences === 'object') {
        return preferences.emailNotifications !== false;
      }
      return true; // Default to enabled
      
    } else {
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, recipientId))
        .limit(1);
      
      // Check community settings
      const settings = community?.settings as any;
      if (settings && typeof settings === 'object') {
        return settings.emailNotifications !== false;
      }
      return true; // Default to enabled
    }
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to enabled if error
  }
}