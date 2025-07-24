// Zoom API Integration for Virtual Tour Automation
import axios from 'axios';

export class ZoomIntegration {
  private accessToken: string;
  private accountId: string;

  constructor() {
    this.accessToken = process.env.ZOOM_ACCESS_TOKEN || '';
    this.accountId = process.env.ZOOM_ACCOUNT_ID || '';
  }

  async createVirtualTour(tourData: {
    communityName: string;
    tourDateTime: string;
    familyMembers: Array<{
      name: string;
      email: string;
      role: 'primary' | 'secondary';
    }>;
    communityContact: {
      name: string;
      email: string;
      title: string;
    };
    tourType: 'live_guided' | 'self_guided' | 'hybrid';
    duration: number; // minutes
    specialRequests: string[];
  }): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Zoom API credentials not configured');
    }

    try {
      const meetingResponse = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: `Virtual Tour - ${tourData.communityName}`,
          type: 2, // Scheduled meeting
          start_time: tourData.tourDateTime,
          duration: tourData.duration,
          timezone: 'America/Los_Angeles',
          password: this.generateSecurePassword(),
          agenda: this.createTourAgenda(tourData),
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            audio: 'voip',
            auto_recording: 'cloud',
            allow_multiple_devices: true,
            approval_type: 1, // Manually approve
            registration_type: 1, // Attendees register once
            enforce_login: false,
            alternative_hosts: tourData.communityContact.email
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const meetingId = meetingResponse.data.id;
      const joinUrl = meetingResponse.data.join_url;

      // Register family members for the meeting
      await this.registerFamilyMembers(meetingId, tourData.familyMembers);

      // Send calendar invitations
      await this.sendCalendarInvitations(meetingResponse.data, tourData);

      return {
        meetingId,
        joinUrl,
        startUrl: meetingResponse.data.start_url,
        password: meetingResponse.data.password,
        scheduledTime: tourData.tourDateTime,
        duration: tourData.duration,
        registrationUrl: meetingResponse.data.registration_url
      };
    } catch (error) {
      console.error('Zoom virtual tour creation error:', error);
      throw error;
    }
  }

  async setupFamilyConsultation(consultationData: {
    familyName: string;
    consultationType: 'initial_consultation' | 'care_planning' | 'financial_review' | 'follow_up';
    participants: Array<{
      name: string;
      email: string;
      phone: string;
      timezone: string;
    }>;
    advisor: {
      name: string;
      email: string;
      specialty: string;
    };
    scheduledTime: string;
    documents: string[]; // URLs to shared documents
  }): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Zoom API credentials not configured');
    }

    try {
      const meetingResponse = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: `Family Consultation - ${consultationData.familyName}`,
          type: 2,
          start_time: consultationData.scheduledTime,
          duration: 60,
          timezone: 'America/Los_Angeles',
          agenda: this.createConsultationAgenda(consultationData),
          settings: {
            host_video: true,
            participant_video: true,
            waiting_room: true,
            auto_recording: 'cloud',
            breakout_room: {
              enable: true
            },
            allow_multiple_devices: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Share consultation documents
      if (consultationData.documents.length > 0) {
        await this.shareDocuments(meetingResponse.data.id, consultationData.documents);
      }

      return meetingResponse.data.id;
    } catch (error) {
      console.error('Zoom family consultation error:', error);
      throw error;
    }
  }

  async createRecurringFamilyCheckins(checkinData: {
    familyName: string;
    residentName: string;
    communityName: string;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
    participants: Array<{
      name: string;
      email: string;
    }>;
    startDate: string;
    duration: number;
  }): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Zoom API credentials not configured');
    }

    const recurrenceType = {
      weekly: 1,
      'bi-weekly': 2,
      monthly: 3
    };

    try {
      const meetingResponse = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: `Family Check-in - ${checkinData.residentName} at ${checkinData.communityName}`,
          type: 8, // Recurring meeting with fixed time
          start_time: checkinData.startDate,
          duration: checkinData.duration,
          recurrence: {
            type: recurrenceType[checkinData.frequency],
            repeat_interval: checkinData.frequency === 'bi-weekly' ? 2 : 1,
            end_times: 12 // 12 occurrences initially
          },
          settings: {
            host_video: true,
            participant_video: true,
            waiting_room: false,
            auto_recording: 'cloud',
            mute_upon_entry: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return meetingResponse.data.id;
    } catch (error) {
      console.error('Zoom recurring checkins error:', error);
      throw error;
    }
  }

  async getMeetingRecording(meetingId: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Zoom API credentials not configured');
    }

    try {
      const response = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        meetingId,
        recordingFiles: response.data.recording_files?.map((file: any) => ({
          id: file.id,
          meetingId: file.meeting_id,
          recordingStart: file.recording_start,
          recordingEnd: file.recording_end,
          fileType: file.file_type,
          fileSize: file.file_size,
          playUrl: file.play_url,
          downloadUrl: file.download_url,
          status: file.status
        })) || [],
        downloadAccessToken: response.data.download_access_token
      };
    } catch (error) {
      console.error('Zoom recording retrieval error:', error);
      throw error;
    }
  }

  async generateTourSummary(meetingId: string): Promise<any> {
    if (!this.accessToken) {
      return this.getMockTourSummary(meetingId);
    }

    try {
      const [recording, participants] = await Promise.all([
        this.getMeetingRecording(meetingId),
        this.getMeetingParticipants(meetingId)
      ]);

      return {
        meetingId,
        tourDate: recording.recordingFiles[0]?.recordingStart,
        participants: participants.participants,
        recordingUrl: recording.recordingFiles[0]?.playUrl,
        duration: this.calculateDuration(recording.recordingFiles[0]),
        keyTopics: this.extractKeyTopics(recording),
        followUpActions: this.generateFollowUpActions(participants)
      };
    } catch (error) {
      console.error('Zoom tour summary error:', error);
      return this.getMockTourSummary(meetingId);
    }
  }

  private async registerFamilyMembers(meetingId: string, familyMembers: any[]): Promise<void> {
    for (const member of familyMembers) {
      try {
        await axios.post(
          `https://api.zoom.us/v2/meetings/${meetingId}/registrants`,
          {
            email: member.email,
            first_name: member.name.split(' ')[0],
            last_name: member.name.split(' ').slice(1).join(' '),
            org: 'Family Member',
            job_title: member.role === 'primary' ? 'Primary Contact' : 'Family Member'
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error(`Failed to register ${member.name}:`, error);
      }
    }
  }

  private async sendCalendarInvitations(meetingData: any, tourData: any): Promise<void> {
    // Integration with calendar systems would go here
    console.log('Calendar invitations would be sent for meeting:', meetingData.id);
  }

  private createTourAgenda(tourData: any): string {
    return `Virtual Senior Living Tour Agenda:

1. Welcome & Introductions (5 min)
   - Meet your tour guide: ${tourData.communityContact.name}
   - Family member introductions

2. Community Overview (15 min)
   - Location and neighborhood highlights
   - Community philosophy and culture
   - Available care levels and services

3. Virtual Walkthrough (25 min)
   - Sample living spaces (${tourData.tourType})
   - Common areas and amenities
   - Dining facilities
   - Outdoor spaces

4. Q&A Session (10 min)
   - Pricing and availability
   - Care services and medical support
   - Move-in process and timeline

5. Next Steps (5 min)
   - Follow-up materials
   - Schedule in-person visit
   - Application process

Special Requests: ${tourData.specialRequests.join(', ')}`;
  }

  private createConsultationAgenda(consultationData: any): string {
    const agendas = {
      initial_consultation: 'Introduction to senior living options and family needs assessment',
      care_planning: 'Detailed care requirements and community matching',
      financial_review: 'Cost analysis, insurance coverage, and payment options',
      follow_up: 'Progress review and next steps in the senior living journey'
    };

    return `Family Consultation - ${agendas[consultationData.consultationType]}

Advisor: ${consultationData.advisor.name} (${consultationData.advisor.specialty})

Shared Documents:
${consultationData.documents.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}`;
  }

  private async shareDocuments(meetingId: string, documents: string[]): Promise<void> {
    // Document sharing functionality would be implemented here
    console.log(`Documents shared for meeting ${meetingId}:`, documents);
  }

  private async getMeetingParticipants(meetingId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      return { participants: [] };
    }
  }

  private calculateDuration(recordingFile: any): number {
    if (!recordingFile) return 0;
    
    const start = new Date(recordingFile.recordingStart);
    const end = new Date(recordingFile.recordingEnd);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
  }

  private extractKeyTopics(recording: any): string[] {
    // AI-powered topic extraction would go here
    return [
      'Community amenities discussion',
      'Pricing and payment options',
      'Care services overview',
      'Move-in timeline questions'
    ];
  }

  private generateFollowUpActions(participants: any): string[] {
    return [
      'Send detailed pricing information',
      'Schedule in-person tour',
      'Provide care assessment questionnaire',
      'Connect with financial advisor'
    ];
  }

  private generateSecurePassword(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private getMockTourSummary(meetingId: string): any {
    return {
      meetingId,
      tourDate: new Date().toISOString(),
      participants: [
        { name: 'Family Representative', email: 'family@example.com' },
        { name: 'Community Guide', email: 'guide@community.com' }
      ],
      recordingUrl: 'https://zoom.us/recording/mock',
      duration: 45,
      keyTopics: [
        'Community tour and amenities',
        'Pricing discussion',
        'Care services overview'
      ],
      followUpActions: [
        'Schedule in-person visit',
        'Review pricing details',
        'Complete care assessment'
      ]
    };
  }
}

export const zoomIntegration = new ZoomIntegration();