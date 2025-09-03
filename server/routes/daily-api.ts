import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Mock data for demonstration
const mockSchedule = {
  morning: [
    {
      time: '7:30 AM',
      activity: 'Breakfast & Coffee Social',
      location: 'Main Dining Room',
      status: 'attended',
      icon: 'coffee'
    },
    {
      time: '9:00 AM',
      activity: 'Chair Yoga',
      location: 'Activity Room',
      status: 'attended',
      icon: 'activity'
    }
  ],
  afternoon: [
    {
      time: '2:00 PM',
      activity: 'Art Class: Watercolor Painting',
      location: 'Art Studio',
      status: 'scheduled',
      icon: 'palette'
    },
    {
      time: '3:30 PM',
      activity: 'Live Piano Performance',
      location: 'Main Lounge',
      status: 'scheduled',
      icon: 'music'
    }
  ],
  evening: [
    {
      time: '6:30 PM',
      activity: 'Bingo Night',
      location: 'Recreation Hall',
      status: 'scheduled',
      icon: 'users'
    }
  ]
};

const mockMenu = {
  breakfast: {
    time: '7:00 AM - 9:00 AM',
    items: [
      'Scrambled eggs with whole wheat toast',
      'Fresh fruit salad',
      'Oatmeal with berries',
      'Orange juice, coffee, or tea'
    ],
    dietary: ['Low Sodium', 'Diabetic Friendly']
  },
  lunch: {
    time: '12:00 PM - 1:30 PM',
    items: [
      'Grilled chicken breast with herbs',
      'Steamed vegetables',
      'Garden salad',
      'Rice pilaf',
      'Fresh baked rolls'
    ],
    dietary: ['Gluten-Free Option', 'Heart Healthy']
  },
  dinner: {
    time: '5:00 PM - 6:30 PM',
    items: [
      'Baked salmon with lemon dill sauce',
      'Roasted sweet potatoes',
      'Green beans almondine',
      'Chocolate pudding for dessert'
    ],
    dietary: ['Omega-3 Rich', 'Low Cholesterol']
  }
};

const mockWellness = {
  overallScore: 92,
  mood: {
    morning: { emoji: '😊', label: 'Happy' },
    afternoon: { emoji: '😌', label: 'Relaxed' },
    evening: { emoji: '😊', label: 'Content' }
  },
  metrics: {
    physicalActivity: '45 min',
    socialInteraction: 'High',
    mealCompletion: '100%',
    medicationAdherence: 'On Track'
  },
  staffNote: {
    note: 'Had a wonderful day! Participated actively in art class and really enjoyed the piano performance. Great appetite at all meals.',
    author: 'Sarah M., Care Coordinator',
    time: '3:45 PM'
  }
};

const mockPhotos = [
  {
    id: '1',
    caption: 'Art class creation',
    date: 'Today',
    url: '/api/placeholder/400/400'
  },
  {
    id: '2',
    caption: 'Lunch with friends',
    date: 'Today',
    url: '/api/placeholder/400/400'
  },
  {
    id: '3',
    caption: 'Morning exercise',
    date: 'Yesterday',
    url: '/api/placeholder/400/400'
  },
  {
    id: '4',
    caption: 'Garden walk',
    date: 'Yesterday',
    url: '/api/placeholder/400/400'
  },
  {
    id: '5',
    caption: 'Bingo winner!',
    date: '2 days ago',
    url: '/api/placeholder/400/400'
  },
  {
    id: '6',
    caption: 'Birthday celebration',
    date: '2 days ago',
    url: '/api/placeholder/400/400'
  }
];

// Get daily schedule for a resident
router.get('/daily/schedule/:residentId', async (req, res) => {
  try {
    const { residentId } = req.params;
    const { date } = req.query;
    
    // In production, fetch from database
    // For now, return mock data
    res.json({
      residentId,
      date: date || new Date().toISOString().split('T')[0],
      schedule: mockSchedule,
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Get meal menu for a resident
router.get('/daily/menu/:residentId', async (req, res) => {
  try {
    const { residentId } = req.params;
    const { date } = req.query;
    
    // In production, fetch from database
    // For now, return mock data
    res.json({
      residentId,
      date: date || new Date().toISOString().split('T')[0],
      menu: mockMenu,
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Get wellness data for a resident
router.get('/daily/wellness/:residentId', async (req, res) => {
  try {
    const { residentId } = req.params;
    
    // In production, fetch from database
    // For now, return mock data
    res.json({
      residentId,
      date: new Date().toISOString().split('T')[0],
      wellness: mockWellness,
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error fetching wellness:', error);
    res.status(500).json({ error: 'Failed to fetch wellness data' });
  }
});

// Get photos for a resident
router.get('/daily/photos/:residentId', async (req, res) => {
  try {
    const { residentId } = req.params;
    
    // In production, fetch from database
    // For now, return mock data
    res.json({
      residentId,
      photos: mockPhotos,
      total: mockPhotos.length,
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Send a message
router.post('/daily/messages', async (req, res) => {
  try {
    const { residentId, recipient, message } = req.body;
    
    // Validate input
    if (!residentId || !message) {
      return res.status(400).json({ error: 'Resident ID and message are required' });
    }
    
    // In production, save to database and send notification
    // For now, return success
    res.json({
      success: true,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Upload a photo
router.post('/daily/photos', async (req, res) => {
  try {
    const { residentId, caption, imageData } = req.body;
    
    // Validate input
    if (!residentId) {
      return res.status(400).json({ error: 'Resident ID is required' });
    }
    
    // In production, upload to storage and save metadata
    // For now, return success
    res.json({
      success: true,
      photoId: `photo_${Date.now()}`,
      url: '/api/placeholder/400/400',
      timestamp: new Date().toISOString(),
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Update activity status
router.put('/daily/schedule/:residentId/activity/:activityId', async (req, res) => {
  try {
    const { residentId, activityId } = req.params;
    const { status, notes } = req.body;
    
    // Validate input
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // In production, update in database
    // For now, return success
    res.json({
      success: true,
      residentId,
      activityId,
      status,
      notes,
      updatedAt: new Date().toISOString(),
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Add wellness update
router.post('/daily/wellness/:residentId', async (req, res) => {
  try {
    const { residentId } = req.params;
    const { mood, metrics, notes } = req.body;
    
    // Validate input
    if (!mood && !metrics && !notes) {
      return res.status(400).json({ error: 'At least one wellness update is required' });
    }
    
    // In production, save to database
    // For now, return success
    res.json({
      success: true,
      residentId,
      wellnessId: `wellness_${Date.now()}`,
      timestamp: new Date().toISOString(),
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error adding wellness update:', error);
    res.status(500).json({ error: 'Failed to add wellness update' });
  }
});

// Schedule a video call
router.post('/daily/calls/schedule', async (req, res) => {
  try {
    const { residentId, scheduledTime, participants } = req.body;
    
    // Validate input
    if (!residentId || !scheduledTime || !participants) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // In production, schedule call and send notifications
    // For now, return success
    res.json({
      success: true,
      callId: `call_${Date.now()}`,
      scheduledTime,
      meetingLink: `https://meet.myseniorvalet.com/room/${Date.now()}`,
      _version: 'v4_streaming_2024'
    });
  } catch (error) {
    console.error('Error scheduling call:', error);
    res.status(500).json({ error: 'Failed to schedule call' });
  }
});

export default router;