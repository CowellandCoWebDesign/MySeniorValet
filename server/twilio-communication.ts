// Twilio SMS/Voice Integration for Real-time Family Communication
import twilio from 'twilio';

export class TwilioCommunicationService {
  private client: any;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  async sendTourReminder(familyMember: any, tourDetails: any): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.messages.create({
        body: `Tour Reminder: ${tourDetails.communityName} tomorrow at ${tourDetails.time}. Need directions? Reply HELP`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: familyMember.phone
      });
      return true;
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return false;
    }
  }

  async sendAvailabilityAlert(familyMembers: any[], availability: any): Promise<void> {
    if (!this.client) return;

    const message = `URGENT: ${availability.communityName} just had a ${availability.unitType} become available! Price: ${availability.price}/month. Call now: ${availability.phone}`;

    for (const member of familyMembers) {
      try {
        await this.client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: member.phone
        });
      } catch (error) {
        console.error(`Failed to send SMS to ${member.phone}:`, error);
      }
    }
  }

  async initiateThreeWayCall(familyMember: any, communityPhone: string): Promise<string> {
    if (!this.client) throw new Error('Twilio not configured');

    const call = await this.client.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: familyMember.phone,
      twiml: `
        <Response>
          <Say>Connecting you to your selected senior living community. Please hold.</Say>
          <Dial>${communityPhone}</Dial>
        </Response>
      `
    });

    return call.sid;
  }
}

export const twilioCommunication = new TwilioCommunicationService();