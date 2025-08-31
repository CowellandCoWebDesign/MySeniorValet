import { db } from "../db";
import { messages, conversations, familyGroups, tours, communities } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Helper function to get or create family conversation
async function getOrCreateFamilyConversation(familyGroupId: number) {
  let conversation = await db.select()
    .from(conversations)
    .where(and(
      eq(conversations.type, 'family_group'),
      eq(conversations.familyGroupId, familyGroupId)
    ))
    .limit(1);

  if (conversation.length === 0) {
    // Get family group to get members
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, familyGroupId))
      .limit(1);

    if (group.length === 0) {
      throw new Error("Family group not found");
    }

    const participants = group[0].members.map((member: any) => ({
      userId: member.userId,
      role: member.role === 'owner' ? 'owner' : 'member',
      joinedAt: new Date().toISOString(),
      notifications: true
    }));

    const [newConv] = await db.insert(conversations).values({
      type: 'family_group' as const,
      title: `${group[0].name} Family Thread`,
      familyGroupId,
      participants,
      lastMessageAt: new Date()
    }).returning();
    
    conversation = [newConv];
  }

  return conversation[0];
}

// Send tour completed notification
export async function sendTourCompletedNotification(
  familyGroupId: number,
  tourId: number,
  communityId: number,
  tourDate: Date,
  notes?: string
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  // Get community details
  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  
  const message = `✅ Tour completed at ${communityName} on ${tourDate.toLocaleDateString()} at ${tourDate.toLocaleTimeString()}${notes ? `\n\nNotes: ${notes}` : ''}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: 'system',
    senderType: 'community' as const,
    content: message,
    messageType: 'tour_completed' as const,
    tourId,
    communityId,
    systemEventData: {
      eventType: 'tour_completed',
      tourDate: tourDate.toISOString(),
      additionalInfo: notes
    }
  });

  // Update conversation last message
  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: message.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}

// Send deposit made notification
export async function sendDepositNotification(
  familyGroupId: number,
  communityId: number,
  amount: number,
  unitNumber?: string
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  // Get community details
  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  
  const message = `💳 Deposit of $${amount.toLocaleString()} placed at ${communityName}${unitNumber ? ` for Unit ${unitNumber}` : ''}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: 'system',
    senderType: 'community' as const,
    content: message,
    messageType: 'deposit_made' as const,
    communityId,
    systemEventData: {
      eventType: 'deposit_made',
      depositAmount: amount,
      unitNumber
    }
  });

  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: message.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}

// Send application started notification
export async function sendApplicationStartedNotification(
  familyGroupId: number,
  communityId: number,
  applicantName: string
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  
  const message = `📝 Application process begun for ${applicantName} at ${communityName}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: 'system',
    senderType: 'community' as const,
    content: message,
    messageType: 'application_started' as const,
    communityId,
    systemEventData: {
      eventType: 'application_started',
      additionalInfo: applicantName
    }
  });

  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: message.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}

// Send unit reserved notification
export async function sendUnitReservedNotification(
  familyGroupId: number,
  communityId: number,
  unitNumber: string,
  moveInDate?: Date
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  
  const message = `🔐 Unit ${unitNumber} reserved at ${communityName}${moveInDate ? ` - Move-in scheduled for ${moveInDate.toLocaleDateString()}` : ''}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: 'system',
    senderType: 'community' as const,
    content: message,
    messageType: 'unit_reserved' as const,
    communityId,
    systemEventData: {
      eventType: 'unit_reserved',
      unitNumber,
      moveInDate: moveInDate?.toISOString()
    }
  });

  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: message.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}

// Send move-in completed notification
export async function sendMoveInCompletedNotification(
  familyGroupId: number,
  communityId: number,
  unitNumber: string,
  residentName: string
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  
  const message = `🏡 Move-in completed! ${residentName} has successfully moved into Unit ${unitNumber} at ${communityName}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: 'system',
    senderType: 'community' as const,
    content: message,
    messageType: 'move_in_completed' as const,
    communityId,
    systemEventData: {
      eventType: 'move_in_completed',
      unitNumber,
      additionalInfo: residentName
    }
  });

  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: message.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}

// Allow users to reference tour reports in messages
export async function sendTourReferenceMessage(
  familyGroupId: number,
  userId: string,
  tourId: number,
  message: string
) {
  const conversation = await getOrCreateFamilyConversation(familyGroupId);
  
  // Get tour details
  const tour = await db.select()
    .from(tours)
    .where(eq(tours.id, tourId))
    .limit(1);

  if (tour.length === 0) {
    throw new Error("Tour not found");
  }

  const community = await db.select()
    .from(communities)
    .where(eq(communities.id, tour[0].communityId))
    .limit(1);

  const communityName = community[0]?.name || "Unknown Community";
  const tourDate = tour[0].scheduledDate;
  
  const fullMessage = `📋 Referencing tour at ${communityName} from ${tourDate?.toLocaleDateString()}\n\n${message}`;

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: userId,
    senderType: 'user' as const,
    content: fullMessage,
    messageType: 'tour_reference' as const,
    tourId,
    communityId: tour[0].communityId,
    systemEventData: {
      eventType: 'tour_reference',
      tourDate: tourDate?.toISOString()
    }
  });

  await db.update(conversations)
    .set({ 
      lastMessageAt: new Date(),
      lastMessagePreview: fullMessage.substring(0, 100)
    })
    .where(eq(conversations.id, conversation.id));
}