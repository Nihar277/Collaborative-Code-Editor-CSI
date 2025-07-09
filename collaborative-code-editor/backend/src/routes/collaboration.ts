import express from 'express';
import Document from '../models/Document';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to authenticate JWT
import { Request, Response, NextFunction } from 'express';

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

// Invite a collaborator
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const { email, permission } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Prevent duplicate
    if (doc.collaborators.some(c => c.userId.toString() === user.id.toString())) {
      return res.status(409).json({ message: 'User already a collaborator' });
    }
    doc.collaborators.push({
      userId: user.id,
      permission: permission || 'editor',
      joinedAt: new Date(),
    });
    await doc.save();
    // TODO: Send email notification
    res.json({ message: 'Collaborator invited', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// List collaborators
router.get('/:id/collaborators', authenticateToken, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('collaborators.userId', 'email username avatar');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc.collaborators);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Update collaborator permission
router.put('/:id/collaborators/:userId', authenticateToken, async (req, res) => {
  try {
    const { permission } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const collaborator = doc.collaborators.find(c => c.userId.toString() === req.params.userId);
    if (!collaborator) return res.status(404).json({ message: 'Collaborator not found' });
    collaborator.permission = permission;
    await doc.save();
    res.json({ message: 'Permission updated', collaborator });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Remove collaborator
router.delete('/:id/collaborators/:userId', authenticateToken, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    doc.collaborators = doc.collaborators.filter(c => c.userId.toString() !== req.params.userId);
    await doc.save();
    res.json({ message: 'Collaborator removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router; 