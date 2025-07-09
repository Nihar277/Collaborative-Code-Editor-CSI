import express, { Request, Response, NextFunction } from 'express';
import Document from '../models/Document';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Middleware to authenticate JWT
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// List all documents for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const docs = await Document.find({
      $or: [
        { owner: req.user.userId },
        { 'collaborators.userId': req.user.userId }
      ]
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Create a new document
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, content, language, isPublic } = req.body;
    const doc = new Document({
      title,
      content,
      language,
      owner: req.user.userId,
      collaborators: [{ userId: req.user.userId, permission: 'owner', joinedAt: new Date() }],
      versions: [],
      isPublic: isPublic || false,
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get a document by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Update a document
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get document versions
router.get('/:id/versions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc.versions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Save a new version
router.post('/:id/versions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { content, message } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.versions.push({
      content,
      author: req.user.userId,
      timestamp: new Date(),
      message: message || '',
    });
    await doc.save();
    res.status(201).json(doc.versions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router; 