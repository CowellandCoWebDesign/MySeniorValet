import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Mock data store - will be replaced with database
const staffData = {
  members: [
    {
      id: '1',
      name: 'Sarah Johnson, RN',
      role: 'Director of Nursing',
      department: 'Nursing',
      photo: '/api/placeholder/100/100',
      email: 'sarah.j@community.com',
      phone: '(555) 123-4567',
      certifications: ['RN', 'CPR', 'Dementia Care', 'Wound Care'],
      specializations: ['Memory Care', 'Rehabilitation', 'Palliative Care'],
      shift: 'Day Shift (7AM-3PM)',
      status: 'on-duty',
      rating: 4.9,
      yearsExperience: 15,
      languages: ['English', 'Spanish'],
      emergencyContact: '(555) 987-6543',
      nextTraining: 'Annual CPR Recertification',
      complianceScore: 98
    },
    {
      id: '2',
      name: 'Michael Chen, LPN',
      role: 'Charge Nurse',
      department: 'Nursing',
      photo: '/api/placeholder/100/100',
      email: 'michael.c@community.com',
      phone: '(555) 234-5678',
      certifications: ['LPN', 'CPR', 'Medication Administration'],
      specializations: ['Cardiac Care', 'Diabetes Management'],
      shift: 'Evening Shift (3PM-11PM)',
      status: 'off-duty',
      rating: 4.7,
      yearsExperience: 8,
      languages: ['English', 'Mandarin'],
      emergencyContact: '(555) 876-5432',
      nextTraining: 'Infection Control Update',
      complianceScore: 95
    },
    {
      id: '3',
      name: 'Emily Rodriguez, CNA',
      role: 'Certified Nursing Assistant',
      department: 'Care Team',
      photo: '/api/placeholder/100/100',
      email: 'emily.r@community.com',
      phone: '(555) 345-6789',
      certifications: ['CNA', 'CPR', 'First Aid'],
      specializations: ['Personal Care', 'Mobility Assistance'],
      shift: 'Day Shift (7AM-3PM)',
      status: 'on-duty',
      rating: 4.8,
      yearsExperience: 5,
      languages: ['English', 'Spanish', 'Portuguese'],
      emergencyContact: '(555) 765-4321',
      nextTraining: 'Infection Control',
      complianceScore: 97
    }
  ],
  shifts: [
    {
      id: '1',
      staffId: '1',
      staffName: 'Sarah Johnson, RN',
      date: new Date().toISOString().split('T')[0],
      startTime: '7:00 AM',
      endTime: '3:00 PM',
      department: 'Nursing',
      status: 'in-progress'
    },
    {
      id: '2',
      staffId: '3',
      staffName: 'Emily Rodriguez, CNA',
      date: new Date().toISOString().split('T')[0],
      startTime: '7:00 AM',
      endTime: '3:00 PM',
      department: 'Care Team',
      status: 'in-progress'
    },
    {
      id: '3',
      staffId: '2',
      staffName: 'Michael Chen, LPN',
      date: new Date().toISOString().split('T')[0],
      startTime: '3:00 PM',
      endTime: '11:00 PM',
      department: 'Nursing',
      status: 'scheduled'
    }
  ],
  trainings: [
    {
      id: '1',
      name: 'Annual CPR Recertification',
      type: 'Safety',
      dueDate: '2025-10-15',
      status: 'pending',
      mandatory: true,
      credits: 4,
      assignedTo: ['1', '2', '3']
    },
    {
      id: '2',
      name: 'Dementia Care Best Practices',
      type: 'Clinical',
      dueDate: '2025-09-30',
      status: 'pending',
      mandatory: false,
      credits: 8,
      assignedTo: ['1', '2']
    },
    {
      id: '3',
      name: 'Infection Control Update',
      type: 'Compliance',
      dueDate: '2025-09-15',
      status: 'overdue',
      mandatory: true,
      credits: 2,
      assignedTo: ['2', '3']
    }
  ],
  certifications: [
    {
      staffId: '1',
      certificates: [
        { name: 'RN', issueDate: '2010-06-15', expiryDate: '2026-06-15', status: 'active' },
        { name: 'CPR', issueDate: '2024-01-10', expiryDate: '2026-01-10', status: 'active' },
        { name: 'Dementia Care', issueDate: '2023-09-20', expiryDate: '2025-09-20', status: 'expiring-soon' },
        { name: 'Wound Care', issueDate: '2023-11-01', expiryDate: '2025-11-01', status: 'active' }
      ]
    }
  ],
  statistics: {
    totalStaff: 48,
    onDutyNow: 16,
    complianceRate: 96,
    averageRating: 4.8,
    departmentBreakdown: {
      nursing: 12,
      careTeam: 18,
      dining: 8,
      activities: 4,
      administration: 6
    },
    upcomingTrainings: 5,
    expiringCertifications: 3
  }
};

// Get all staff members
router.get('/members', async (req: Request, res: Response) => {
  try {
    const { department, status, search } = req.query;
    
    let filteredStaff = [...staffData.members];
    
    if (department && department !== 'all') {
      filteredStaff = filteredStaff.filter(s => 
        s.department.toLowerCase() === String(department).toLowerCase()
      );
    }
    
    if (status) {
      filteredStaff = filteredStaff.filter(s => s.status === status);
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredStaff = filteredStaff.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.role.toLowerCase().includes(searchTerm) ||
        s.department.toLowerCase().includes(searchTerm)
      );
    }
    
    res.json({
      success: true,
      data: filteredStaff,
      total: filteredStaff.length
    });
  } catch (error) {
    console.error('Error fetching staff members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch staff members' 
    });
  }
});

// Get staff member by ID
router.get('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffMember = staffData.members.find(m => m.id === id);
    
    if (!staffMember) {
      return res.status(404).json({ 
        success: false, 
        error: 'Staff member not found' 
      });
    }
    
    res.json({
      success: true,
      data: staffMember
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch staff member' 
    });
  }
});

// Create new staff member
router.post('/members', async (req: Request, res: Response) => {
  try {
    const newMember = {
      id: String(Date.now()),
      ...req.body,
      status: 'off-duty',
      rating: 0,
      complianceScore: 100
    };
    
    staffData.members.push(newMember);
    
    res.json({
      success: true,
      data: newMember,
      message: 'Staff member added successfully'
    });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create staff member' 
    });
  }
});

// Update staff member
router.put('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberIndex = staffData.members.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Staff member not found' 
      });
    }
    
    staffData.members[memberIndex] = {
      ...staffData.members[memberIndex],
      ...req.body
    };
    
    res.json({
      success: true,
      data: staffData.members[memberIndex],
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update staff member' 
    });
  }
});

// Get shifts
router.get('/shifts', async (req: Request, res: Response) => {
  try {
    const { date, department, status } = req.query;
    
    let filteredShifts = [...staffData.shifts];
    
    if (date) {
      filteredShifts = filteredShifts.filter(s => s.date === date);
    }
    
    if (department) {
      filteredShifts = filteredShifts.filter(s => 
        s.department.toLowerCase() === String(department).toLowerCase()
      );
    }
    
    if (status) {
      filteredShifts = filteredShifts.filter(s => s.status === status);
    }
    
    res.json({
      success: true,
      data: filteredShifts,
      total: filteredShifts.length
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch shifts' 
    });
  }
});

// Create shift
router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const newShift = {
      id: String(Date.now()),
      ...req.body,
      status: 'scheduled'
    };
    
    staffData.shifts.push(newShift);
    
    res.json({
      success: true,
      data: newShift,
      message: 'Shift scheduled successfully'
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create shift' 
    });
  }
});

// Update shift
router.put('/shifts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shiftIndex = staffData.shifts.findIndex(s => s.id === id);
    
    if (shiftIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Shift not found' 
      });
    }
    
    staffData.shifts[shiftIndex] = {
      ...staffData.shifts[shiftIndex],
      ...req.body
    };
    
    res.json({
      success: true,
      data: staffData.shifts[shiftIndex],
      message: 'Shift updated successfully'
    });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update shift' 
    });
  }
});

// Get trainings
router.get('/trainings', async (req: Request, res: Response) => {
  try {
    const { status, mandatory, staffId } = req.query;
    
    let filteredTrainings = [...staffData.trainings];
    
    if (status) {
      filteredTrainings = filteredTrainings.filter(t => t.status === status);
    }
    
    if (mandatory !== undefined) {
      filteredTrainings = filteredTrainings.filter(t => 
        t.mandatory === (mandatory === 'true')
      );
    }
    
    if (staffId) {
      filteredTrainings = filteredTrainings.filter(t => 
        t.assignedTo.includes(String(staffId))
      );
    }
    
    res.json({
      success: true,
      data: filteredTrainings,
      total: filteredTrainings.length
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trainings' 
    });
  }
});

// Create training
router.post('/trainings', async (req: Request, res: Response) => {
  try {
    const newTraining = {
      id: String(Date.now()),
      ...req.body,
      status: 'pending',
      assignedTo: req.body.assignedTo || []
    };
    
    staffData.trainings.push(newTraining);
    
    res.json({
      success: true,
      data: newTraining,
      message: 'Training scheduled successfully'
    });
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create training' 
    });
  }
});

// Get certifications for staff member
router.get('/certifications/:staffId', async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const staffCerts = staffData.certifications.find(c => c.staffId === staffId);
    
    if (!staffCerts) {
      return res.json({
        success: true,
        data: { staffId, certificates: [] }
      });
    }
    
    res.json({
      success: true,
      data: staffCerts
    });
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch certifications' 
    });
  }
});

// Update certifications
router.put('/certifications/:staffId', async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const certIndex = staffData.certifications.findIndex(c => c.staffId === staffId);
    
    if (certIndex === -1) {
      staffData.certifications.push({
        staffId,
        certificates: req.body.certificates
      });
    } else {
      staffData.certifications[certIndex].certificates = req.body.certificates;
    }
    
    res.json({
      success: true,
      message: 'Certifications updated successfully'
    });
  } catch (error) {
    console.error('Error updating certifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update certifications' 
    });
  }
});

// Get staff statistics
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: staffData.statistics
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Update staff status (clock in/out)
router.post('/clock/:action', async (req: Request, res: Response) => {
  try {
    const { action } = req.params;
    const { staffId } = req.body;
    
    const memberIndex = staffData.members.findIndex(m => m.id === staffId);
    
    if (memberIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Staff member not found' 
      });
    }
    
    if (action === 'in') {
      staffData.members[memberIndex].status = 'on-duty';
      staffData.statistics.onDutyNow++;
    } else if (action === 'out') {
      staffData.members[memberIndex].status = 'off-duty';
      staffData.statistics.onDutyNow--;
    } else if (action === 'break') {
      staffData.members[memberIndex].status = 'on-break';
    }
    
    res.json({
      success: true,
      data: staffData.members[memberIndex],
      message: `Successfully clocked ${action}`
    });
  } catch (error) {
    console.error('Error updating clock status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update clock status' 
    });
  }
});

export default router;