import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

interface UserPresence {
  userId: string;
  username: string;
  documentId: string;
  socketId: string;
}

const activeUsers: Record<string, UserPresence[]> = {};

export function initSocket(server: http.Server) {
  const io = new IOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join document room
    socket.on('join-document', ({ documentId, userId, username }) => {
      try {
        if (!documentId || !userId || !username) {
          console.warn('Invalid join-document data:', { documentId, userId, username });
          return;
        }

        socket.join(documentId);
        
        if (!activeUsers[documentId]) {
          activeUsers[documentId] = [];
        }

        // Remove user if already exists
        activeUsers[documentId] = activeUsers[documentId].filter(u => u.userId !== userId);
        
        // Add new user
        activeUsers[documentId].push({ 
          userId, 
          username, 
          documentId, 
          socketId: socket.id 
        });

        console.log(`👤 User ${username} joined document ${documentId}`);
        
        // Notify all users in the document
        io.to(documentId).emit('user-joined', { userId, username });
        io.to(documentId).emit('presence', activeUsers[documentId]);
        
        // Send confirmation to the joining user
        socket.emit('joined-document', { 
          documentId, 
          users: activeUsers[documentId] 
        });
      } catch (error) {
        console.error('Error in join-document:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // Leave document room
    socket.on('leave-document', ({ documentId, userId }) => {
      try {
        if (!documentId || !userId) {
          console.warn('Invalid leave-document data:', { documentId, userId });
          return;
        }

        socket.leave(documentId);
        
        if (activeUsers[documentId]) {
          activeUsers[documentId] = activeUsers[documentId].filter(u => u.userId !== userId);
          
          if (activeUsers[documentId].length === 0) {
            delete activeUsers[documentId];
          }
          
          console.log(`👋 User ${userId} left document ${documentId}`);
          
          // Notify remaining users
          io.to(documentId).emit('user-left', { userId });
          io.to(documentId).emit('presence', activeUsers[documentId] || []);
        }
      } catch (error) {
        console.error('Error in leave-document:', error);
      }
    });

    // Real-time text operation
    socket.on('text-operation', ({ documentId, operation }) => {
      try {
        if (!documentId || !operation) {
          console.warn('Invalid text-operation data:', { documentId, operation });
          return;
        }

        // Broadcast to other users in the document
        socket.to(documentId).emit('text-operation', operation);
        
        console.log(`📝 Text operation in document ${documentId} by user ${operation.userId}`);
      } catch (error) {
        console.error('Error in text-operation:', error);
      }
    });

    // Cursor position
    socket.on('cursor-position', ({ documentId, userId, position }) => {
      try {
        if (!documentId || !userId || !position) return;
        
        socket.to(documentId).emit('cursor-position', { userId, position });
      } catch (error) {
        console.error('Error in cursor-position:', error);
      }
    });

    // User selection
    socket.on('user-selection', ({ documentId, userId, selection }) => {
      try {
        if (!documentId || !userId || !selection) return;
        
        socket.to(documentId).emit('user-selection', { userId, selection });
      } catch (error) {
        console.error('Error in user-selection:', error);
      }
    });

    // Chat message
    socket.on('chat-message', ({ documentId, message }) => {
      try {
        if (!documentId || !message) {
          console.warn('Invalid chat-message data:', { documentId, message });
          return;
        }

        // Broadcast to all users in the document (including sender for confirmation)
        io.to(documentId).emit('chat-message', message);
        
        console.log(`💬 Chat message in document ${documentId} by ${message.author?.username || 'Unknown'}`);
      } catch (error) {
        console.error('Error in chat-message:', error);
      }
    });

    // Version save
    socket.on('version-save', ({ documentId, version }) => {
      try {
        if (!documentId || !version) return;
        
        io.to(documentId).emit('version-save', version);
        console.log(`💾 Version saved in document ${documentId}`);
      } catch (error) {
        console.error('Error in version-save:', error);
      }
    });

    // Typing indicator
    socket.on('user-typing', ({ documentId, userId }) => {
      try {
        if (!documentId || !userId) return;
        
        socket.to(documentId).emit('user-typing', { userId });
      } catch (error) {
        console.error('Error in user-typing:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
      
      // Remove user from all active documents
      Object.keys(activeUsers).forEach(documentId => {
        const userIndex = activeUsers[documentId].findIndex(u => u.socketId === socket.id);
        if (userIndex !== -1) {
          const user = activeUsers[documentId][userIndex];
          activeUsers[documentId].splice(userIndex, 1);
          
          if (activeUsers[documentId].length === 0) {
            delete activeUsers[documentId];
          }
          
          console.log(`👋 User ${user.username} disconnected from document ${documentId}`);
          
          // Notify remaining users
          io.to(documentId).emit('user-left', { userId: user.userId });
          io.to(documentId).emit('presence', activeUsers[documentId] || []);
        }
      });
    });

    // Handle disconnecting (cleanup)
    socket.on('disconnecting', () => {
      console.log(`🔌 User disconnecting: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Log server status
  console.log('🔌 Socket.IO server initialized');

  return io;
} 