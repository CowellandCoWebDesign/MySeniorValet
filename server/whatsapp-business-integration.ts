// WhatsApp Business API Integration for International Family Communication
import axios from 'axios';

export class WhatsAppBusinessIntegration {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendFamilyUpdate(updateData: {
    recipientNumbers: string[]; // International format: +1234567890
    familyMemberName: string;
    updateType: 'tour_scheduled' | 'application_submitted' | 'move_in_confirmed' | 'emergency_alert';
    communityName: string;
    details: string;
    language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh';
  }): Promise<any> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const message = this.createLocalizedMessage(updateData);

    const results = [];
    for (const recipientNumber of updateData.recipientNumbers) {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: recipientNumber,
            type: 'template',
            template: {
              name: 'senior_living_update',
              language: { code: updateData.language },
              components: [
                {
                  type: 'header',
                  parameters: [
                    { type: 'text', text: updateData.familyMemberName }
                  ]
                },
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: updateData.communityName },
                    { type: 'text', text: updateData.details },
                    { type: 'text', text: this.getUpdateTypeText(updateData.updateType, updateData.language) }
                  ]
                }
              ]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        results.push({
          recipientNumber,
          success: true,
          messageId: response.data.messages[0]?.id
        });
      } catch (error) {
        console.error(`WhatsApp message failed for ${recipientNumber}:`, error);
        results.push({
          recipientNumber,
          success: false,
          error: error.message
        });
      }
    }

    return {
      updateType: updateData.updateType,
      totalRecipients: updateData.recipientNumbers.length,
      successfulDeliveries: results.filter(r => r.success).length,
      results
    };
  }

  async sendTourInvitation(invitationData: {
    familyMembers: Array<{
      name: string;
      phone: string;
      language: string;
      timezone: string;
    }>;
    tourDetails: {
      communityName: string;
      address: string;
      date: string;
      time: string;
      contactPerson: string;
      contactPhone: string;
    };
    coordinatorMessage: string;
  }): Promise<any> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const results = [];
    for (const member of invitationData.familyMembers) {
      try {
        const localizedTime = this.convertToTimezone(
          invitationData.tourDetails.time,
          member.timezone
        );

        const response = await axios.post(
          `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: member.phone,
            type: 'template',
            template: {
              name: 'tour_invitation',
              language: { code: member.language },
              components: [
                {
                  type: 'header',
                  parameters: [
                    { type: 'text', text: member.name }
                  ]
                },
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: invitationData.tourDetails.communityName },
                    { type: 'text', text: invitationData.tourDetails.date },
                    { type: 'text', text: localizedTime },
                    { type: 'text', text: invitationData.tourDetails.address },
                    { type: 'text', text: invitationData.coordinatorMessage }
                  ]
                },
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '0',
                  parameters: [
                    { type: 'payload', payload: `ACCEPT_TOUR_${Date.now()}` }
                  ]
                },
                {
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: '1',
                  parameters: [
                    { type: 'payload', payload: `DECLINE_TOUR_${Date.now()}` }
                  ]
                }
              ]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        results.push({
          memberName: member.name,
          phone: member.phone,
          success: true,
          messageId: response.data.messages[0]?.id
        });
      } catch (error) {
        console.error(`WhatsApp tour invitation failed for ${member.name}:`, error);
        results.push({
          memberName: member.name,
          phone: member.phone,
          success: false,
          error: error.message
        });
      }
    }

    return {
      tourDetails: invitationData.tourDetails,
      invitationResults: results,
      successRate: (results.filter(r => r.success).length / results.length) * 100
    };
  }

  async createFamilyGroup(groupData: {
    groupName: string;
    familyMembers: Array<{
      name: string;
      phone: string;
      role: 'primary' | 'secondary' | 'emergency_contact';
    }>;
    seniorName: string;
    communityContext: string;
  }): Promise<string> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    try {
      // Create group
      const groupResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/groups`,
        {
          subject: groupData.groupName,
          participants: groupData.familyMembers.map(member => member.phone)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const groupId = groupResponse.data.id;

      // Send welcome message to group
      await this.sendGroupWelcomeMessage(groupId, groupData);

      return groupId;
    } catch (error) {
      console.error('WhatsApp group creation error:', error);
      throw error;
    }
  }

  async sendDocumentShare(shareData: {
    recipientNumbers: string[];
    documentType: 'tour_summary' | 'pricing_info' | 'care_assessment' | 'application_form';
    documentUrl: string;
    caption: string;
    language: string;
  }): Promise<any> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('WhatsApp Business API credentials not configured');
    }

    const results = [];
    for (const recipientNumber of shareData.recipientNumbers) {
      try {
        const response = await axios.post(
          `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: recipientNumber,
            type: 'document',
            document: {
              link: shareData.documentUrl,
              caption: shareData.caption,
              filename: this.getDocumentFilename(shareData.documentType, shareData.language)
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        results.push({
          recipientNumber,
          success: true,
          messageId: response.data.messages[0]?.id
        });
      } catch (error) {
        console.error(`WhatsApp document share failed for ${recipientNumber}:`, error);
        results.push({
          recipientNumber,
          success: false,
          error: error.message
        });
      }
    }

    return {
      documentType: shareData.documentType,
      totalRecipients: shareData.recipientNumbers.length,
      successfulShares: results.filter(r => r.success).length,
      results
    };
  }

  async handleIncomingMessage(webhookData: any): Promise<void> {
    try {
      const message = webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return;

      const from = message.from;
      const messageText = message.text?.body;
      const messageType = message.type;

      // Process different types of incoming messages
      if (messageType === 'text') {
        await this.handleTextMessage(from, messageText);
      } else if (messageType === 'button') {
        await this.handleButtonResponse(from, message.button);
      } else if (messageType === 'interactive') {
        await this.handleInteractiveResponse(from, message.interactive);
      }
    } catch (error) {
      console.error('WhatsApp webhook processing error:', error);
    }
  }

  private async sendGroupWelcomeMessage(groupId: string, groupData: any): Promise<void> {
    const welcomeMessage = `Welcome to the ${groupData.seniorName} Family Care Coordination Group! 

This group was created to help coordinate care decisions for ${groupData.seniorName}'s senior living journey. 

Context: ${groupData.communityContext}

Family members in this group:
${groupData.familyMembers.map((member: any) => `• ${member.name} (${member.role})`).join('\n')}

Use this group to:
- Share tour feedback and photos
- Discuss care needs and preferences  
- Coordinate visits and important decisions
- Stay updated on application progress

MySeniorValet is here to support your family through this process. 🏡`;

    await axios.post(
      `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: groupId,
        type: 'text',
        text: { body: welcomeMessage }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  private createLocalizedMessage(updateData: any): any {
    const messages = {
      en: {
        tour_scheduled: `Tour scheduled for ${updateData.familyMemberName} at ${updateData.communityName}`,
        application_submitted: `Application submitted for ${updateData.familyMemberName} at ${updateData.communityName}`,
        move_in_confirmed: `Move-in confirmed for ${updateData.familyMemberName} at ${updateData.communityName}`,
        emergency_alert: `Emergency alert regarding ${updateData.familyMemberName} at ${updateData.communityName}`
      },
      es: {
        tour_scheduled: `Tour programado para ${updateData.familyMemberName} en ${updateData.communityName}`,
        application_submitted: `Solicitud enviada para ${updateData.familyMemberName} en ${updateData.communityName}`,
        move_in_confirmed: `Mudanza confirmada para ${updateData.familyMemberName} en ${updateData.communityName}`,
        emergency_alert: `Alerta de emergencia sobre ${updateData.familyMemberName} en ${updateData.communityName}`
      }
    };

    return messages[updateData.language] || messages.en;
  }

  private getUpdateTypeText(updateType: string, language: string): string {
    const texts = {
      en: {
        tour_scheduled: 'Tour Scheduled',
        application_submitted: 'Application Submitted',
        move_in_confirmed: 'Move-in Confirmed',
        emergency_alert: 'Emergency Alert'
      },
      es: {
        tour_scheduled: 'Tour Programado',
        application_submitted: 'Solicitud Enviada',
        move_in_confirmed: 'Mudanza Confirmada',
        emergency_alert: 'Alerta de Emergencia'
      }
    };

    return texts[language]?.[updateType] || texts.en[updateType];
  }

  private convertToTimezone(time: string, timezone: string): string {
    try {
      const date = new Date(`2024-01-01 ${time}`);
      return date.toLocaleTimeString('en-US', { 
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return time; // Return original time if conversion fails
    }
  }

  private getDocumentFilename(documentType: string, language: string): string {
    const filenames = {
      en: {
        tour_summary: 'Tour_Summary.pdf',
        pricing_info: 'Pricing_Information.pdf',
        care_assessment: 'Care_Assessment.pdf',
        application_form: 'Application_Form.pdf'
      },
      es: {
        tour_summary: 'Resumen_Tour.pdf',
        pricing_info: 'Informacion_Precios.pdf',
        care_assessment: 'Evaluacion_Cuidado.pdf',
        application_form: 'Formulario_Solicitud.pdf'
      }
    };

    return filenames[language]?.[documentType] || filenames.en[documentType];
  }

  private async handleTextMessage(from: string, messageText: string): Promise<void> {
    // Handle text responses from family members
    console.log(`Received text from ${from}: ${messageText}`);
    
    // Auto-respond with helpful information
    if (messageText.toLowerCase().includes('help')) {
      await this.sendHelpMessage(from);
    }
  }

  private async handleButtonResponse(from: string, buttonData: any): Promise<void> {
    // Handle button clicks (tour acceptance/decline, etc.)
    console.log(`Button response from ${from}:`, buttonData);
  }

  private async handleInteractiveResponse(from: string, interactiveData: any): Promise<void> {
    // Handle interactive message responses
    console.log(`Interactive response from ${from}:`, interactiveData);
  }

  private async sendHelpMessage(recipientNumber: string): Promise<void> {
    const helpText = `MySeniorValet Family Support 🏡

Common commands:
• "Status" - Get current application status
• "Schedule" - View upcoming tours/appointments  
• "Contact" - Get community contact info
• "Help" - Show this message

For urgent matters, call our family support line: 1-800-SENIOR-1`;

    await axios.post(
      `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'text',
        text: { body: helpText }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export const whatsappBusiness = new WhatsAppBusinessIntegration();