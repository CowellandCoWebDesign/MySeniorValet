/**
 * Documenso API Routes
 * Handles document signing for leases, healthcare directives, and other legal documents
 */

import { type Express } from "express";
import { documensoService } from "../documenso-integration";
import { isAuthenticated } from "../replitAuth";
import { db } from "../db";
import { communities, users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerDocumensoRoutes(app: Express) {
  
  /**
   * Create and send a lease agreement for signing
   */
  app.post('/api/documenso/lease', isAuthenticated, async (req, res) => {
    try {
      const {
        communityId,
        residentEmail,
        residentName,
        unitNumber,
        monthlyRent,
        leaseStartDate,
        leaseEndDate,
        securityDeposit,
        amenities,
        careLevel
      } = req.body;
      
      if (!documensoService.isConfigured()) {
        return res.status(503).json({
          error: 'Document signing service is not configured'
        });
      }
      
      // Validate community exists
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      
      // Create lease agreement
      const document = await documensoService.createLeaseAgreement(
        communityId,
        residentEmail,
        residentName,
        {
          unitNumber,
          monthlyRent,
          leaseStartDate: new Date(leaseStartDate),
          leaseEndDate: new Date(leaseEndDate),
          securityDeposit,
          amenities: amenities || [],
          careLevel
        }
      );
      
      res.json({
        success: true,
        documentId: document.id,
        status: document.status,
        message: `Lease agreement sent to ${residentEmail} for signing`
      });
      
    } catch (error: any) {
      console.error('Error creating lease agreement:', error);
      res.status(500).json({
        error: 'Failed to create lease agreement',
        details: error.message
      });
    }
  });
  
  /**
   * Create healthcare directive document
   */
  app.post('/api/documenso/healthcare-directive', isAuthenticated, async (req, res) => {
    try {
      const {
        type,
        primaryAgent,
        secondaryAgent,
        medicalWishes,
        restrictions
      } = req.body;
      
      if (!documensoService.isConfigured()) {
        return res.status(503).json({
          error: 'Document signing service is not configured'
        });
      }
      
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      // Create healthcare directive
      const document = await documensoService.createHealthcareDirective(
        userId,
        {
          type,
          primaryAgent,
          secondaryAgent,
          medicalWishes: medicalWishes || [],
          restrictions: restrictions || []
        }
      );
      
      res.json({
        success: true,
        documentId: document.id,
        status: document.status,
        message: 'Healthcare directive created and sent for signing'
      });
      
    } catch (error: any) {
      console.error('Error creating healthcare directive:', error);
      res.status(500).json({
        error: 'Failed to create healthcare directive',
        details: error.message
      });
    }
  });
  
  /**
   * Get document status
   */
  app.get('/api/documenso/document/:documentId', isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      
      if (!documensoService.isConfigured()) {
        return res.status(503).json({
          error: 'Document signing service is not configured'
        });
      }
      
      const document = await documensoService.getDocumentStatus(documentId);
      
      res.json({
        success: true,
        document
      });
      
    } catch (error: any) {
      console.error('Error getting document status:', error);
      res.status(500).json({
        error: 'Failed to get document status',
        details: error.message
      });
    }
  });
  
  /**
   * Download signed document
   */
  app.get('/api/documenso/document/:documentId/download', isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      
      if (!documensoService.isConfigured()) {
        return res.status(503).json({
          error: 'Document signing service is not configured'
        });
      }
      
      const pdfBuffer = await documensoService.downloadSignedDocument(documentId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="signed-document-${documentId}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error: any) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        error: 'Failed to download document',
        details: error.message
      });
    }
  });
  
  /**
   * Webhook endpoint for Documenso callbacks
   */
  app.post('/api/documenso/webhook', async (req, res) => {
    try {
      // Verify webhook signature (if configured)
      const signature = req.headers['x-documenso-signature'];
      // TODO: Implement signature verification
      
      await documensoService.handleWebhook(req.body);
      
      res.status(200).json({ received: true });
      
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        error: 'Failed to process webhook',
        details: error.message
      });
    }
  });
  
  /**
   * Check if Documenso is configured
   */
  app.get('/api/documenso/status', async (req, res) => {
    res.json({
      configured: documensoService.isConfigured(),
      features: {
        leaseAgreements: true,
        healthcareDirectives: true,
        customDocuments: true,
        bulkSending: false, // Future feature
        templates: false // Future feature
      }
    });
  });
}