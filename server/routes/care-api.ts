import { Request, Response, Router } from 'express';
import { db } from '../db';
import { residents, medications, appointments, carePlans, healthRecords } from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get resident health overview
router.get('/api/care/overview/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock data for now - in production would fetch from database
    const overview = {
      residentId,
      healthMetrics: {
        bloodPressure: '120/80',
        heartRate: '72 bpm',
        weight: '165 lbs',
        temperature: '98.6°F',
        lastCheckup: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      medicationCount: 3,
      upcomingAppointments: 2,
      careLevel: 'Assisted Living - Level 2',
      lastUpdated: new Date().toISOString()
    };
    
    res.json(overview);
  } catch (error) {
    console.error('Error fetching care overview:', error);
    res.status(500).json({ error: 'Failed to fetch care overview' });
  }
});

// Get medications
router.get('/api/care/medications/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock medications data
    const medications = [
      {
        id: '1',
        residentId,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times: ['8:00 AM', '8:00 PM'],
        remaining: 28,
        prescribedBy: 'Dr. Smith',
        prescribedDate: '2025-02-01',
        nextRefill: '2025-04-15',
        status: 'active',
        instructions: 'Take with food'
      },
      {
        id: '2',
        residentId,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        times: ['9:00 AM'],
        remaining: 14,
        prescribedBy: 'Dr. Johnson',
        prescribedDate: '2025-01-15',
        nextRefill: '2025-04-01',
        status: 'active',
        instructions: 'Take in the morning'
      },
      {
        id: '3',
        residentId,
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'Once daily',
        times: ['9:00 AM'],
        remaining: 45,
        prescribedBy: 'Dr. Smith',
        prescribedDate: '2025-01-01',
        nextRefill: '2025-05-01',
        status: 'active',
        instructions: 'Take with breakfast'
      }
    ];
    
    res.json({ medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// Add medication
router.post('/api/care/medications', async (req: Request, res: Response) => {
  try {
    const medicationSchema = z.object({
      residentId: z.string(),
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      times: z.array(z.string()),
      prescribedBy: z.string(),
      instructions: z.string().optional()
    });
    
    const data = medicationSchema.parse(req.body);
    
    // In production, would insert into database
    const newMedication = {
      id: Date.now().toString(),
      ...data,
      remaining: 30,
      prescribedDate: new Date().toISOString(),
      nextRefill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
    
    res.json({ medication: newMedication });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(400).json({ error: 'Invalid medication data' });
  }
});

// Get appointments
router.get('/api/care/appointments/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock appointments data
    const appointments = [
      {
        id: '1',
        residentId,
        type: 'Cardiology Checkup',
        doctor: 'Dr. Emily Johnson',
        date: '2025-04-05',
        time: '10:30 AM',
        location: 'Heart Health Center',
        status: 'confirmed',
        notes: 'Annual checkup - bring medication list',
        transportation: 'Facility van arranged'
      },
      {
        id: '2',
        residentId,
        type: 'Physical Therapy',
        doctor: 'PT Sarah Williams',
        date: '2025-04-08',
        time: '2:00 PM',
        location: 'On-site Therapy Room',
        status: 'scheduled',
        notes: 'Session 4 of 8 - knee rehabilitation',
        transportation: 'Not needed - on-site'
      },
      {
        id: '3',
        residentId,
        type: 'Podiatry',
        doctor: 'Dr. Michael Chen',
        date: '2025-04-12',
        time: '3:30 PM',
        location: 'Mobile Clinic Visit',
        status: 'scheduled',
        notes: 'Routine foot care',
        transportation: 'Not needed - mobile clinic'
      }
    ];
    
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Schedule appointment
router.post('/api/care/appointments', async (req: Request, res: Response) => {
  try {
    const appointmentSchema = z.object({
      residentId: z.string(),
      type: z.string(),
      doctor: z.string(),
      date: z.string(),
      time: z.string(),
      location: z.string(),
      notes: z.string().optional(),
      transportation: z.string().optional()
    });
    
    const data = appointmentSchema.parse(req.body);
    
    // In production, would insert into database
    const newAppointment = {
      id: Date.now().toString(),
      ...data,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    res.json({ appointment: newAppointment });
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(400).json({ error: 'Invalid appointment data' });
  }
});

// Get care plan
router.get('/api/care/plan/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock care plan data
    const carePlan = {
      residentId,
      level: 'Assisted Living - Level 2',
      lastUpdated: '2025-03-15',
      nextReview: '2025-06-15',
      primaryDiagnoses: ['Type 2 Diabetes', 'Hypertension', 'Mild Arthritis'],
      assistanceNeeded: [
        'Medication management',
        'Bathing assistance (3x weekly)',
        'Meal preparation',
        'Transportation to appointments'
      ],
      goals: [
        { 
          id: '1',
          goal: 'Maintain blood sugar levels within target range', 
          progress: 85,
          targetDate: '2025-06-01'
        },
        { 
          id: '2',
          goal: 'Increase mobility - walk 500 steps daily', 
          progress: 70,
          targetDate: '2025-05-01'
        },
        { 
          id: '3',
          goal: 'Participate in 3 social activities weekly', 
          progress: 100,
          targetDate: '2025-04-15'
        }
      ],
      careTeam: [
        { role: 'Primary Physician', name: 'Dr. Robert Smith', contact: '555-0101', email: 'dr.smith@healthcare.com' },
        { role: 'Nurse Practitioner', name: 'Sarah Johnson, NP', contact: '555-0102', email: 's.johnson@healthcare.com' },
        { role: 'Care Coordinator', name: 'Maria Garcia', contact: '555-0103', email: 'm.garcia@facility.com' },
        { role: 'Physical Therapist', name: 'James Wilson, PT', contact: '555-0104', email: 'j.wilson@therapy.com' }
      ]
    };
    
    res.json({ carePlan });
  } catch (error) {
    console.error('Error fetching care plan:', error);
    res.status(500).json({ error: 'Failed to fetch care plan' });
  }
});

// Update care plan
router.put('/api/care/plan/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    const carePlanSchema = z.object({
      level: z.string().optional(),
      primaryDiagnoses: z.array(z.string()).optional(),
      assistanceNeeded: z.array(z.string()).optional(),
      goals: z.array(z.object({
        goal: z.string(),
        progress: z.number(),
        targetDate: z.string()
      })).optional()
    });
    
    const updates = carePlanSchema.parse(req.body);
    
    // In production, would update in database
    const updatedPlan = {
      residentId,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ carePlan: updatedPlan });
  } catch (error) {
    console.error('Error updating care plan:', error);
    res.status(400).json({ error: 'Invalid care plan data' });
  }
});

// Get health records
router.get('/api/care/records/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock health records data
    const records = [
      {
        id: '1',
        residentId,
        name: 'Annual Physical Exam',
        date: '2025-03-01',
        type: 'Report',
        category: 'General Health',
        provider: 'Dr. Robert Smith',
        size: '2.4 MB',
        url: '/api/care/records/download/1'
      },
      {
        id: '2',
        residentId,
        name: 'Blood Work Results',
        date: '2025-02-28',
        type: 'Lab',
        category: 'Laboratory',
        provider: 'Quest Diagnostics',
        size: '1.1 MB',
        url: '/api/care/records/download/2'
      },
      {
        id: '3',
        residentId,
        name: 'Cardiology Report',
        date: '2025-02-15',
        type: 'Specialist',
        category: 'Cardiology',
        provider: 'Dr. Emily Johnson',
        size: '3.2 MB',
        url: '/api/care/records/download/3'
      },
      {
        id: '4',
        residentId,
        name: 'X-Ray Results',
        date: '2025-01-20',
        type: 'Imaging',
        category: 'Radiology',
        provider: 'Imaging Center',
        size: '5.8 MB',
        url: '/api/care/records/download/4'
      },
      {
        id: '5',
        residentId,
        name: 'Medication History',
        date: '2025-01-01',
        type: 'Pharmacy',
        category: 'Medications',
        provider: 'CVS Pharmacy',
        size: '0.8 MB',
        url: '/api/care/records/download/5'
      }
    ];
    
    const emergencyInfo = {
      bloodType: 'O Positive',
      allergies: ['Penicillin', 'Shellfish'],
      emergencyContact: {
        name: 'John Doe',
        relationship: 'Son',
        phone: '555-0199'
      },
      advanceDirective: true,
      dnr: false
    };
    
    res.json({ records, emergencyInfo });
  } catch (error) {
    console.error('Error fetching health records:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

// Upload health record
router.post('/api/care/records', async (req: Request, res: Response) => {
  try {
    const recordSchema = z.object({
      residentId: z.string(),
      name: z.string(),
      type: z.string(),
      category: z.string(),
      provider: z.string(),
      fileData: z.string() // Base64 encoded file
    });
    
    const data = recordSchema.parse(req.body);
    
    // In production, would save file and create database record
    const newRecord = {
      id: Date.now().toString(),
      residentId: data.residentId,
      name: data.name,
      date: new Date().toISOString(),
      type: data.type,
      category: data.category,
      provider: data.provider,
      size: '1.0 MB',
      url: `/api/care/records/download/${Date.now()}`
    };
    
    res.json({ record: newRecord });
  } catch (error) {
    console.error('Error uploading health record:', error);
    res.status(400).json({ error: 'Invalid record data' });
  }
});

// Get medication adherence
router.get('/api/care/adherence/:residentId', async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    
    // Mock adherence data
    const adherence = {
      overall: 98,
      lastMonth: {
        taken: 118,
        scheduled: 120,
        missed: 2,
        percentage: 98.3
      },
      byMedication: [
        { name: 'Metformin', adherence: 99 },
        { name: 'Lisinopril', adherence: 97 },
        { name: 'Vitamin D', adherence: 98 }
      ],
      trends: [
        { month: 'January', percentage: 96 },
        { month: 'February', percentage: 97 },
        { month: 'March', percentage: 98 }
      ]
    };
    
    res.json({ adherence });
  } catch (error) {
    console.error('Error fetching adherence data:', error);
    res.status(500).json({ error: 'Failed to fetch adherence data' });
  }
});

export default router;