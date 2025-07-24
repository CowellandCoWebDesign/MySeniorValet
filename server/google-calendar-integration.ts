// Google Calendar Integration for Tour Scheduling
import { google } from 'googleapis';

export class GoogleCalendarIntegration {
  private calendar: any;

  constructor() {
    if (process.env.GOOGLE_CALENDAR_CREDENTIALS) {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/calendar']
      });
      this.calendar = google.calendar({ version: 'v3', auth });
    }
  }

  async scheduleTour(tourDetails: {
    communityName: string;
    date: string;
    time: string;
    duration: number;
    familyEmails: string[];
    communityAddress: string;
    communityPhone: string;
  }): Promise<string> {
    if (!this.calendar) throw new Error('Google Calendar not configured');

    const startDateTime = new Date(`${tourDetails.date}T${tourDetails.time}`);
    const endDateTime = new Date(startDateTime.getTime() + (tourDetails.duration * 60 * 1000));

    const event = {
      summary: `Senior Living Tour - ${tourDetails.communityName}`,
      description: `
        Tour of ${tourDetails.communityName}
        Address: ${tourDetails.communityAddress}
        Phone: ${tourDetails.communityPhone}
        
        Questions to ask:
        - What is the exact monthly cost including all fees?
        - What care services are included vs. additional cost?
        - What is the move-in timeline and process?
        - Can we see actual available units?
      `,
      location: tourDetails.communityAddress,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Los_Angeles'
      },
      attendees: tourDetails.familyEmails.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 120 }, // 2 hours before
        ],
      }
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.data.id;
  }

  async createMoveInPlan(moveDetails: {
    residentName: string;
    communityName: string;
    moveInDate: string;
    familyEmails: string[];
  }): Promise<void> {
    if (!this.calendar) return;

    const moveInDate = new Date(moveDetails.moveInDate);
    const milestones = [
      { days: -30, title: 'Start move-in planning', duration: 60 },
      { days: -14, title: 'Medical records transfer', duration: 120 },
      { days: -7, title: 'Pack personal items', duration: 240 },
      { days: -3, title: 'Confirm move-in logistics', duration: 60 },
      { days: 0, title: 'MOVE-IN DAY', duration: 480 },
      { days: 3, title: 'First week check-in', duration: 60 }
    ];

    for (const milestone of milestones) {
      const eventDate = new Date(moveInDate.getTime() + (milestone.days * 24 * 60 * 60 * 1000));
      
      await this.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: `${moveDetails.communityName}: ${milestone.title}`,
          start: { dateTime: eventDate.toISOString() },
          end: { dateTime: new Date(eventDate.getTime() + (milestone.duration * 60 * 1000)).toISOString() },
          attendees: moveDetails.familyEmails.map(email => ({ email }))
        }
      });
    }
  }
}

export const googleCalendar = new GoogleCalendarIntegration();