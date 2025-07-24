// Uber & Lyft API Integration for Senior Transportation Coordination
import axios from 'axios';

export class UberLyftIntegration {
  private uberToken: string;
  private lyftToken: string;

  constructor() {
    this.uberToken = process.env.UBER_ACCESS_TOKEN || '';
    this.lyftToken = process.env.LYFT_ACCESS_TOKEN || '';
  }

  async scheduleTransportationForTour(tripData: {
    passengerName: string;
    passengerPhone: string;
    pickupAddress: string;
    communityAddress: string;
    scheduledDateTime: string;
    returnTrip: boolean;
    accessibilityNeeds: string[];
    familyContactInfo: {
      name: string;
      phone: string;
      email: string;
    };
    preferences: {
      provider: 'uber' | 'lyft' | 'either';
      vehicleType: 'standard' | 'accessible' | 'premium';
      maxWaitTime: number; // minutes
    };
  }): Promise<any> {
    const results = [];

    if (tripData.preferences.provider === 'uber' || tripData.preferences.provider === 'either') {
      try {
        const uberTrip = await this.scheduleUberTrip(tripData);
        results.push({ provider: 'uber', ...uberTrip });
      } catch (error) {
        console.error('Uber scheduling error:', error);
        results.push({ provider: 'uber', error: error.message });
      }
    }

    if (tripData.preferences.provider === 'lyft' || tripData.preferences.provider === 'either') {
      try {
        const lyftTrip = await this.scheduleLyftTrip(tripData);
        results.push({ provider: 'lyft', ...lyftTrip });
      } catch (error) {
        console.error('Lyft scheduling error:', error);
        results.push({ provider: 'lyft', error: error.message });
      }
    }

    // Return the best option or both if comparing
    return this.selectBestTransportationOption(results, tripData);
  }

  private async scheduleUberTrip(tripData: any): Promise<any> {
    if (!this.uberToken) {
      throw new Error('Uber API credentials not configured');
    }

    // Get fare estimate first
    const fareEstimate = await this.getUberFareEstimate(
      tripData.pickupAddress,
      tripData.communityAddress,
      tripData.preferences.vehicleType
    );

    // Schedule the trip
    const response = await axios.post(
      'https://api.uber.com/v1.2/requests',
      {
        start_latitude: fareEstimate.pickup.lat,
        start_longitude: fareEstimate.pickup.lng,
        end_latitude: fareEstimate.destination.lat,
        end_longitude: fareEstimate.destination.lng,
        start_address: tripData.pickupAddress,
        end_address: tripData.communityAddress,
        scheduled_time: new Date(tripData.scheduledDateTime).getTime() / 1000,
        product_id: this.getUberProductId(tripData.preferences.vehicleType),
        payment_method_id: 'cash', // Senior-friendly payment
        surge_confirmation_id: fareEstimate.surge_confirmation_id,
        fare_id: fareEstimate.fare_id
      },
      {
        headers: {
          'Authorization': `Bearer ${this.uberToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      tripId: response.data.request_id,
      status: response.data.status,
      driver: response.data.driver || null,
      vehicle: response.data.vehicle || null,
      eta: response.data.eta,
      fareEstimate: fareEstimate.estimate,
      trackingUrl: `https://m.uber.com/looking?request_id=${response.data.request_id}`,
      cancellationUrl: response.data.cancel_url
    };
  }

  private async scheduleLyftTrip(tripData: any): Promise<any> {
    if (!this.lyftToken) {
      throw new Error('Lyft API credentials not configured');
    }

    // Get fare estimate
    const fareEstimate = await this.getLyftFareEstimate(
      tripData.pickupAddress,
      tripData.communityAddress,
      tripData.preferences.vehicleType
    );

    // Schedule the trip
    const response = await axios.post(
      'https://api.lyft.com/v1/rides',
      {
        ride_type: this.getLyftRideType(tripData.preferences.vehicleType),
        origin: {
          lat: fareEstimate.pickup.lat,
          lng: fareEstimate.pickup.lng,
          address: tripData.pickupAddress
        },
        destination: {
          lat: fareEstimate.destination.lat,
          lng: fareEstimate.destination.lng,
          address: tripData.communityAddress
        },
        scheduled_pickup_time: new Date(tripData.scheduledDateTime).toISOString(),
        passenger_detail: {
          first_name: tripData.passengerName.split(' ')[0],
          last_name: tripData.passengerName.split(' ').slice(1).join(' '),
          phone_number: tripData.passengerPhone,
          image_url: null
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.lyftToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      tripId: response.data.ride_id,
      status: response.data.status,
      driver: response.data.driver || null,
      vehicle: response.data.vehicle || null,
      eta: response.data.pickup_eta,
      fareEstimate: fareEstimate.estimate,
      trackingUrl: response.data.tracking_url,
      cancellationId: response.data.cancel_url
    };
  }

  async createRecurringTransportation(recurringData: {
    residentName: string;
    communityAddress: string;
    destinations: Array<{
      name: string;
      address: string;
      frequency: 'weekly' | 'bi-weekly' | 'monthly';
      dayOfWeek: number; // 0 = Sunday, 6 = Saturday
      time: string; // HH:MM format
      type: 'medical' | 'social' | 'shopping' | 'family_visit';
    }>;
    familyContact: {
      name: string;
      phone: string;
      email: string;
    };
    accessibilityRequirements: string[];
    paymentMethod: 'family_account' | 'community_billing' | 'individual';
  }): Promise<any> {
    const scheduledTrips = [];

    for (const destination of recurringData.destinations) {
      try {
        // Calculate next 12 occurrences based on frequency
        const occurrences = this.calculateRecurringOccurrences(
          destination.frequency,
          destination.dayOfWeek,
          destination.time,
          12
        );

        for (const occurrence of occurrences) {
          const tripData = {
            passengerName: recurringData.residentName,
            passengerPhone: recurringData.familyContact.phone,
            pickupAddress: recurringData.communityAddress,
            communityAddress: destination.address,
            scheduledDateTime: occurrence.datetime,
            returnTrip: true,
            accessibilityNeeds: recurringData.accessibilityRequirements,
            familyContactInfo: recurringData.familyContact,
            preferences: {
              provider: 'either' as const,
              vehicleType: this.getVehicleTypeForAccessibility(recurringData.accessibilityRequirements),
              maxWaitTime: 10
            }
          };

          const scheduledTrip = await this.scheduleTransportationForTour(tripData);
          scheduledTrips.push({
            destination: destination.name,
            type: destination.type,
            scheduledTime: occurrence.datetime,
            ...scheduledTrip
          });
        }
      } catch (error) {
        console.error(`Failed to schedule recurring trip to ${destination.name}:`, error);
      }
    }

    return {
      residentName: recurringData.residentName,
      totalTripsScheduled: scheduledTrips.length,
      scheduledTrips,
      familyContact: recurringData.familyContact
    };
  }

  async setupFamilyVisitTransportation(visitData: {
    residentName: string;
    communityAddress: string;
    familyMembers: Array<{
      name: string;
      address: string;
      phone: string;
    }>;
    visitDateTime: string;
    returnDateTime: string;
    specialRequests: string[];
  }): Promise<any> {
    const transportationPlans = [];

    for (const member of visitData.familyMembers) {
      try {
        // Schedule pickup from family member's location to community
        const pickupTrip = await this.scheduleTransportationForTour({
          passengerName: member.name,
          passengerPhone: member.phone,
          pickupAddress: member.address,
          communityAddress: visitData.communityAddress,
          scheduledDateTime: visitData.visitDateTime,
          returnTrip: false,
          accessibilityNeeds: [],
          familyContactInfo: {
            name: member.name,
            phone: member.phone,
            email: ''
          },
          preferences: {
            provider: 'either',
            vehicleType: 'standard',
            maxWaitTime: 15
          }
        });

        // Schedule return trip
        const returnTrip = await this.scheduleTransportationForTour({
          passengerName: member.name,
          passengerPhone: member.phone,
          pickupAddress: visitData.communityAddress,
          communityAddress: member.address,
          scheduledDateTime: visitData.returnDateTime,
          returnTrip: false,
          accessibilityNeeds: [],
          familyContactInfo: {
            name: member.name,
            phone: member.phone,
            email: ''
          },
          preferences: {
            provider: 'either',
            vehicleType: 'standard',
            maxWaitTime: 15
          }
        });

        transportationPlans.push({
          familyMember: member.name,
          pickupTrip,
          returnTrip,
          totalEstimatedCost: (pickupTrip.fareEstimate || 0) + (returnTrip.fareEstimate || 0)
        });
      } catch (error) {
        console.error(`Failed to schedule transportation for ${member.name}:`, error);
        transportationPlans.push({
          familyMember: member.name,
          error: error.message
        });
      }
    }

    return {
      visitDetails: visitData,
      transportationPlans,
      totalFamilyMembers: visitData.familyMembers.length,
      successfulBookings: transportationPlans.filter(plan => !plan.error).length
    };
  }

  async getTransportationStatus(tripId: string, provider: 'uber' | 'lyft'): Promise<any> {
    try {
      if (provider === 'uber') {
        const response = await axios.get(
          `https://api.uber.com/v1.2/requests/${tripId}`,
          {
            headers: { 'Authorization': `Bearer ${this.uberToken}` }
          }
        );
        return this.formatUberStatus(response.data);
      } else {
        const response = await axios.get(
          `https://api.lyft.com/v1/rides/${tripId}`,
          {
            headers: { 'Authorization': `Bearer ${this.lyftToken}` }
          }
        );
        return this.formatLyftStatus(response.data);
      }
    } catch (error) {
      console.error(`Failed to get ${provider} trip status:`, error);
      throw error;
    }
  }

  private async getUberFareEstimate(pickup: string, destination: string, vehicleType: string): Promise<any> {
    // Mock fare estimate - real implementation would geocode addresses and call Uber API
    return {
      pickup: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7849, lng: -122.4094 },
      estimate: this.calculateMockFare(pickup, destination),
      fare_id: `fare_${Date.now()}`,
      surge_confirmation_id: null
    };
  }

  private async getLyftFareEstimate(pickup: string, destination: string, vehicleType: string): Promise<any> {
    // Mock fare estimate - real implementation would geocode addresses and call Lyft API
    return {
      pickup: { lat: 37.7749, lng: -122.4194 },
      destination: { lat: 37.7849, lng: -122.4094 },
      estimate: this.calculateMockFare(pickup, destination)
    };
  }

  private calculateMockFare(pickup: string, destination: string): number {
    // Simple distance-based fare calculation for demo
    const baseFare = 3.50;
    const perMileFare = 1.75;
    const estimatedMiles = 5; // Mock distance
    return baseFare + (perMileFare * estimatedMiles);
  }

  private getUberProductId(vehicleType: string): string {
    const productIds = {
      standard: 'a1111c8c-c720-46c3-8534-2fcdd730040d', // UberX
      accessible: 'wheelchair', // UberWAV
      premium: 'premium' // Uber Black
    };
    return productIds[vehicleType] || productIds.standard;
  }

  private getLyftRideType(vehicleType: string): string {
    const rideTypes = {
      standard: 'lyft',
      accessible: 'lyft_lux',
      premium: 'lyft_lux'
    };
    return rideTypes[vehicleType] || rideTypes.standard;
  }

  private selectBestTransportationOption(results: any[], tripData: any): any {
    const successfulResults = results.filter(r => !r.error);
    
    if (successfulResults.length === 0) {
      return { error: 'No transportation providers available', results };
    }

    if (successfulResults.length === 1) {
      return successfulResults[0];
    }

    // Compare by fare and ETA
    const bestOption = successfulResults.reduce((best, current) => {
      const bestScore = (best.fareEstimate || 999) + (best.eta || 999);
      const currentScore = (current.fareEstimate || 999) + (current.eta || 999);
      return currentScore < bestScore ? current : best;
    });

    return {
      recommended: bestOption,
      alternatives: successfulResults.filter(r => r !== bestOption),
      comparisonFactors: ['fare', 'eta', 'vehicle_availability']
    };
  }

  private calculateRecurringOccurrences(frequency: string, dayOfWeek: number, time: string, count: number): any[] {
    const occurrences = [];
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    for (let i = 0; i < count; i++) {
      const date = new Date(now);
      
      if (frequency === 'weekly') {
        date.setDate(date.getDate() + (7 * i) + (dayOfWeek - date.getDay()));
      } else if (frequency === 'bi-weekly') {
        date.setDate(date.getDate() + (14 * i) + (dayOfWeek - date.getDay()));
      } else if (frequency === 'monthly') {
        date.setMonth(date.getMonth() + i);
        date.setDate(dayOfWeek === 0 ? 1 : dayOfWeek * 4); // Approximate monthly scheduling
      }

      date.setHours(hours, minutes, 0, 0);
      
      if (date > now) {
        occurrences.push({
          datetime: date.toISOString(),
          occurrence: i + 1
        });
      }
    }

    return occurrences;
  }

  private getVehicleTypeForAccessibility(requirements: string[]): 'standard' | 'accessible' | 'premium' {
    if (requirements.some(req => req.toLowerCase().includes('wheelchair'))) {
      return 'accessible';
    }
    return 'standard';
  }

  private formatUberStatus(data: any): any {
    return {
      tripId: data.request_id,
      status: data.status,
      driver: data.driver ? {
        name: data.driver.name,
        phone: data.driver.phone_number,
        rating: data.driver.rating,
        picture: data.driver.picture_url
      } : null,
      vehicle: data.vehicle ? {
        make: data.vehicle.make,
        model: data.vehicle.model,
        licensePlate: data.vehicle.license_plate,
        color: data.vehicle.color
      } : null,
      location: data.location,
      eta: data.eta,
      destination: data.destination
    };
  }

  private formatLyftStatus(data: any): any {
    return {
      tripId: data.ride_id,
      status: data.status,
      driver: data.driver ? {
        name: `${data.driver.first_name} ${data.driver.last_name}`,
        phone: data.driver.phone_number,
        rating: data.driver.rating,
        picture: data.driver.image_url
      } : null,
      vehicle: data.vehicle ? {
        make: data.vehicle.make,
        model: data.vehicle.model,
        licensePlate: data.vehicle.license_plate,
        color: data.vehicle.color
      } : null,
      location: data.location,
      eta: data.pickup_eta,
      destination: data.destination
    };
  }
}

export const uberLyftIntegration = new UberLyftIntegration();