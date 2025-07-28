import { type Express } from "express";
import { db } from "../db";
import { messages, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const createDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['personal', 'medical', 'financial', 'legal', 'community', 'other']),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false)
});

export function registerDocumentRoutes(app: Express) {
  // Upload document
  app.post('/api/documents/upload', requireAuth, upload.single('document'), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const metadata = req.body;
      const validatedData = createDocumentSchema.parse(metadata);

      const [document] = await db
        .insert(documents)
        .values({
          userId,
          ...validatedData,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedBy: userId
        })
        .returning();

      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid document metadata', errors: error.errors });
      }
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });

  // Get user's documents
  app.get('/api/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { category, search } = req.query;

      let conditions = [eq(documents.userId, userId)];
      
      if (category) {
        conditions.push(eq(documents.category, category as any));
      }
      
      if (search) {
        conditions.push(
          sql`${documents.title} ILIKE ${'%' + search + '%'} OR ${documents.description} ILIKE ${'%' + search + '%'}`
        );
      }

      const userDocuments = await db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.createdAt));

      res.json(userDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // Get document details
  app.get('/api/documents/:documentId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);

      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check access permissions
      if (document.userId !== userId && !document.isPublic) {
        // Check if user has been granted access
        const [access] = await db
          .select()
          .from(documentAccess)
          .where(and(
            eq(documentAccess.documentId, documentId),
            eq(documentAccess.userId, userId)
          ))
          .limit(1);

        if (!access) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ message: 'Failed to fetch document' });
    }
  });

  // Download document
  app.get('/api/documents/:documentId/download', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);

      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check access permissions
      if (document.userId !== userId && !document.isPublic) {
        const [access] = await db
          .select()
          .from(documentAccess)
          .where(and(
            eq(documentAccess.documentId, documentId),
            eq(documentAccess.userId, userId)
          ))
          .limit(1);

        if (!access) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      // Check if file exists
      try {
        await fs.access(document.filePath);
      } catch {
        return res.status(404).json({ message: 'File not found' });
      }

      res.download(document.filePath, document.fileName);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ message: 'Failed to download document' });
    }
  });

  // Update document metadata
  app.patch('/api/documents/:documentId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.id;
      delete updates.userId;
      delete updates.filePath;
      delete updates.fileName;
      delete updates.fileSize;
      delete updates.mimeType;

      const [updated] = await db
        .update(documents)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: 'Document not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ message: 'Failed to update document' });
    }
  });

  // Delete document
  app.delete('/api/documents/:documentId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);

      const [document] = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        ))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      // Delete document record
      await db
        .delete(documents)
        .where(eq(documents.id, documentId));

      // Delete all access records
      await db
        .delete(documentAccess)
        .where(eq(documentAccess.documentId, documentId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ message: 'Failed to delete document' });
    }
  });

  // Share document
  app.post('/api/documents/:documentId/share', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);
      const { email, permissions = 'view' } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Verify document ownership
      const [document] = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.id, documentId),
          eq(documents.userId, userId)
        ))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Find user to share with
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if already shared
      const [existingAccess] = await db
        .select()
        .from(documentAccess)
        .where(and(
          eq(documentAccess.documentId, documentId),
          eq(documentAccess.userId, targetUser.id)
        ))
        .limit(1);

      if (existingAccess) {
        return res.status(400).json({ message: 'Document already shared with this user' });
      }

      // Grant access
      const [access] = await db
        .insert(documentAccess)
        .values({
          documentId,
          userId: targetUser.id,
          grantedBy: userId,
          permissions
        })
        .returning();

      res.json(access);
    } catch (error) {
      console.error('Error sharing document:', error);
      res.status(500).json({ message: 'Failed to share document' });
    }
  });

  // Revoke document access
  app.delete('/api/documents/:documentId/share/:userId', requireAuth, async (req: any, res) => {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const documentId = parseInt(req.params.documentId);
      const targetUserId = req.params.userId;

      // Verify document ownership
      const [document] = await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.id, documentId),
          eq(documents.userId, ownerId)
        ))
        .limit(1);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      await db
        .delete(documentAccess)
        .where(and(
          eq(documentAccess.documentId, documentId),
          eq(documentAccess.userId, targetUserId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error revoking access:', error);
      res.status(500).json({ message: 'Failed to revoke access' });
    }
  });
}