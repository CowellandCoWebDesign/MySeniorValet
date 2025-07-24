import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { redisCache } from './redis-cache';

interface DocumentMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedBy: number;
  uploadedAt: Date;
  documentType: 'medical' | 'legal' | 'lease' | 'insurance' | 'identification' | 'other';
  familyId?: string;
  communityId?: number;
  isPrivate: boolean;
  description?: string;
  expiresAt?: Date;
  tags: string[];
}

interface DocumentAccess {
  userId: number;
  permissions: ('read' | 'write' | 'delete' | 'share')[];
  grantedBy: number;
  grantedAt: Date;
}

class DocumentManagement {
  private uploadsDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private allowedMimeTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log('✅ Document uploads directory ready');
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  // Configure multer for file uploads
  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 5 // Max 5 files per upload
      }
    });
  }

  // Store document metadata
  async storeDocumentMetadata(metadata: DocumentMetadata): Promise<void> {
    try {
      // Store in Redis for quick access
      await redisCache.set(`document:${metadata.id}`, metadata, 86400 * 30); // 30 days

      // Also maintain an index by family/community
      if (metadata.familyId) {
        const familyDocs = await this.getFamilyDocuments(metadata.familyId);
        familyDocs.push(metadata.id);
        await redisCache.set(`family_docs:${metadata.familyId}`, familyDocs, 86400 * 30);
      }

      if (metadata.communityId) {
        const communityDocs = await this.getCommunityDocuments(metadata.communityId);
        communityDocs.push(metadata.id);
        await redisCache.set(`community_docs:${metadata.communityId}`, communityDocs, 86400 * 30);
      }

      // Index by user
      const userDocs = await this.getUserDocuments(metadata.uploadedBy);
      userDocs.push(metadata.id);
      await redisCache.set(`user_docs:${metadata.uploadedBy}`, userDocs, 86400 * 30);

    } catch (error) {
      console.error('Failed to store document metadata:', error);
      throw error;
    }
  }

  // Upload document endpoint
  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const user = req.user as any; // Authenticated user
      const { documentType, familyId, communityId, isPrivate, description, tags } = req.body;

      const uploadedDocuments: DocumentMetadata[] = [];

      for (const file of files) {
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const metadata: DocumentMetadata = {
          id: documentId,
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: user.id,
          uploadedAt: new Date(),
          documentType: documentType || 'other',
          familyId,
          communityId,
          isPrivate: isPrivate === 'true',
          description,
          tags: tags ? JSON.parse(tags) : []
        };

        await this.storeDocumentMetadata(metadata);
        uploadedDocuments.push(metadata);
      }

      res.json({
        success: true,
        documents: uploadedDocuments
      });

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload documents' });
    }
  }

  // Get document metadata
  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    try {
      return await redisCache.get<DocumentMetadata>(`document:${documentId}`);
    } catch (error) {
      console.error('Failed to get document metadata:', error);
      return null;
    }
  }

  // Download document
  async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const user = req.user as any;

      const metadata = await this.getDocumentMetadata(documentId);
      if (!metadata) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Check permissions
      const hasAccess = await this.checkDocumentAccess(documentId, user.id, 'read');
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const filePath = path.join(this.uploadsDir, metadata.filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        res.status(404).json({ error: 'File not found on disk' });
        return;
      }

      // Set appropriate headers
      res.setHeader('Content-Type', metadata.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
      
      // Send file
      res.sendFile(filePath);

    } catch (error) {
      console.error('Document download error:', error);
      res.status(500).json({ error: 'Failed to download document' });
    }
  }

  // Check document access permissions
  async checkDocumentAccess(documentId: string, userId: number, permission: 'read' | 'write' | 'delete' | 'share'): Promise<boolean> {
    try {
      const metadata = await this.getDocumentMetadata(documentId);
      if (!metadata) return false;

      // Owner has all permissions
      if (metadata.uploadedBy === userId) return true;

      // Check explicit access grants
      const access = await redisCache.get<DocumentAccess[]>(`document_access:${documentId}`) || [];
      const userAccess = access.find(a => a.userId === userId);
      
      if (userAccess && userAccess.permissions.includes(permission)) {
        return true;
      }

      // Check family access (if user is family member)
      if (metadata.familyId && !metadata.isPrivate) {
        const familyMembers = await this.getFamilyMembers(metadata.familyId);
        return familyMembers.includes(userId);
      }

      // Check community access (if user is community manager)
      if (metadata.communityId) {
        const communityManagers = await this.getCommunityManagers(metadata.communityId);
        return communityManagers.includes(userId);
      }

      return false;
    } catch (error) {
      console.error('Failed to check document access:', error);
      return false;
    }
  }

  // Grant document access
  async grantDocumentAccess(documentId: string, userId: number, permissions: ('read' | 'write' | 'delete' | 'share')[], grantedBy: number): Promise<boolean> {
    try {
      const access = await redisCache.get<DocumentAccess[]>(`document_access:${documentId}`) || [];
      
      // Remove existing access for this user
      const filteredAccess = access.filter(a => a.userId !== userId);
      
      // Add new access
      filteredAccess.push({
        userId,
        permissions,
        grantedBy,
        grantedAt: new Date()
      });

      await redisCache.set(`document_access:${documentId}`, filteredAccess, 86400 * 30);
      return true;
    } catch (error) {
      console.error('Failed to grant document access:', error);
      return false;
    }
  }

  // List documents for user
  async listUserDocuments(userId: number, filters?: {
    documentType?: string;
    familyId?: string;
    communityId?: number;
    includeShared?: boolean;
  }): Promise<DocumentMetadata[]> {
    try {
      const userDocIds = await this.getUserDocuments(userId);
      const documents: DocumentMetadata[] = [];

      for (const docId of userDocIds) {
        const metadata = await this.getDocumentMetadata(docId);
        if (metadata) {
          // Apply filters
          if (filters?.documentType && metadata.documentType !== filters.documentType) continue;
          if (filters?.familyId && metadata.familyId !== filters.familyId) continue;
          if (filters?.communityId && metadata.communityId !== filters.communityId) continue;

          documents.push(metadata);
        }
      }

      // Include shared documents if requested
      if (filters?.includeShared) {
        // This would require a more complex query to find documents shared with this user
        // Implementation depends on how sharing relationships are stored
      }

      return documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      console.error('Failed to list user documents:', error);
      return [];
    }
  }

  // Delete document
  async deleteDocument(documentId: string, userId: number): Promise<boolean> {
    try {
      const metadata = await this.getDocumentMetadata(documentId);
      if (!metadata) return false;

      const hasAccess = await this.checkDocumentAccess(documentId, userId, 'delete');
      if (!hasAccess) return false;

      // Delete file from disk
      const filePath = path.join(this.uploadsDir, metadata.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.log('File already deleted from disk:', error);
      }

      // Remove metadata from cache
      await redisCache.del(`document:${documentId}`);
      await redisCache.del(`document_access:${documentId}`);

      // Remove from indexes
      if (metadata.familyId) {
        const familyDocs = await this.getFamilyDocuments(metadata.familyId);
        const updatedDocs = familyDocs.filter(id => id !== documentId);
        await redisCache.set(`family_docs:${metadata.familyId}`, updatedDocs, 86400 * 30);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  // Helper methods for getting document lists
  private async getUserDocuments(userId: number): Promise<string[]> {
    return await redisCache.get<string[]>(`user_docs:${userId}`) || [];
  }

  private async getFamilyDocuments(familyId: string): Promise<string[]> {
    return await redisCache.get<string[]>(`family_docs:${familyId}`) || [];
  }

  private async getCommunityDocuments(communityId: number): Promise<string[]> {
    return await redisCache.get<string[]>(`community_docs:${communityId}`) || [];
  }

  // Placeholder methods for family/community member checks
  private async getFamilyMembers(familyId: string): Promise<number[]> {
    // This would integrate with your family management system
    return await redisCache.get<number[]>(`family_members:${familyId}`) || [];
  }

  private async getCommunityManagers(communityId: number): Promise<number[]> {
    // This would integrate with your community management system
    return await redisCache.get<number[]>(`community_managers:${communityId}`) || [];
  }

  // Document sharing via secure links
  async createShareableLink(documentId: string, userId: number, expiresIn: number = 86400): Promise<string | null> {
    try {
      const hasAccess = await this.checkDocumentAccess(documentId, userId, 'share');
      if (!hasAccess) return null;

      const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      const shareData = {
        documentId,
        sharedBy: userId,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      };

      await redisCache.set(`share_token:${shareToken}`, shareData, expiresIn);
      return shareToken;
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      return null;
    }
  }

  // Access document via share token
  async accessSharedDocument(shareToken: string): Promise<DocumentMetadata | null> {
    try {
      const shareData = await redisCache.get<any>(`share_token:${shareToken}`);
      if (!shareData) return null;

      const metadata = await this.getDocumentMetadata(shareData.documentId);
      return metadata;
    } catch (error) {
      console.error('Failed to access shared document:', error);
      return null;
    }
  }
}

export const documentManagement = new DocumentManagement();