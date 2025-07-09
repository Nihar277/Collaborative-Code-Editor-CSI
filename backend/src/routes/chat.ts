import express from 'express';
import ChatMessage from '../models/ChatMessage';
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

// Get chat messages for a document
router.get('/:id/chat', authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ documentId: req.params.id }).populate('author', 'username avatar');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Post a new chat message
router.post('/:id/chat', authenticateToken, async (req, res) => {
  try {
    const { content, type } = req.body;
    const message = new ChatMessage({
      documentId: req.params.id,
      author: req.user.userId,
      content,
      timestamp: new Date(),
      type: type || 'message',
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router; 