import { Router } from 'express';
import { storage } from '../storage';
import { insertRemovalRequestSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Submit a removal request
router.post('/api/removal-requests', async (req, res) => {
  try {
    const validatedData = insertRemovalRequestSchema.parse(req.body);
    
    // Add metadata
    const requestData = {
      ...validatedData,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    };
    
    const removalRequest = await storage.createRemovalRequest(requestData);
    
    res.json({
      success: true,
      message: 'Your removal request has been submitted successfully. We will review it within 24-48 hours.',
      requestId: removalRequest.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    } else {
      console.error('Error creating removal request:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit removal request'
      });
    }
  }
});

// Get removal requests (admin only)
router.get('/api/admin/removal-requests', async (req, res) => {
  try {
    // TODO: Add proper admin authentication check
    const { status, requestType } = req.query;
    
    const requests = await storage.getRemovalRequests({
      status: status as string,
      requestType: requestType as string
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching removal requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch removal requests'
    });
  }
});

// Update removal request status (admin only)
router.patch('/api/admin/removal-requests/:id', async (req, res) => {
  try {
    // TODO: Add proper admin authentication check
    const requestId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedRequest = await storage.updateRemovalRequest(requestId, updates);
    
    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        error: 'Removal request not found'
      });
    }
    
    res.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating removal request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update removal request'
    });
  }
});

export default router;