import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

interface UserPresence {
  userId: string;
  username: string;
  documentId: string;
}

const activeUsers: Record<string, UserPresence[]> = {};

export function initSocket(server: http.Server) {
  const io = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    // Join document room
    socket.on('join-document', ({ documentId, userId, username }) => {
      socket.join(documentId);
      if (!activeUsers[documentId]) activeUsers[documentId] = [];
      activeUsers[documentId].push({ userId, username, documentId });
      io.to(documentId).emit('user-joined', { userId, username });
      io.to(documentId).emit('presence', activeUsers[documentId]);
    });

    // Leave document room
    socket.on('leave-document', ({ documentId, userId }) => {
      socket.leave(documentId);
      if (activeUsers[documentId]) {
        activeUsers[documentId] = activeUsers[documentId].filter(u => u.userId !== userId);
        io.to(documentId).emit('user-left', { userId });
        io.to(documentId).emit('presence', activeUsers[documentId]);
      }
    });

    // Real-time text operation (OT placeholder)
    socket.on('text-operation', ({ documentId, operation }) => {
      socket.to(documentId).emit('text-operation', operation);
    });

    // Cursor position
    socket.on('cursor-position', ({ documentId, userId, position }) => {
      socket.to(documentId).emit('cursor-position', { userId, position });
    });

    // User selection
    socket.on('user-selection', ({ documentId, userId, selection }) => {
      socket.to(documentId).emit('user-selection', { userId, selection });
    });

    // Chat message
    socket.on('chat-message', ({ documentId, message }) => {
      io.to(documentId).emit('chat-message', message);
    });

    // Version save
    socket.on('version-save', ({ documentId, version }) => {
      io.to(documentId).emit('version-save', version);
    });

    // Typing indicator
    socket.on('user-typing', ({ documentId, userId }) => {
      socket.to(documentId).emit('user-typing', { userId });
    });

    // Handle disconnect
    socket.on('disconnecting', () => {
      Object.keys(socket.rooms).forEach(room => {
        if (activeUsers[room]) {
          activeUsers[room] = activeUsers[room].filter(u => u.userId !== socket.id);
          io.to(room).emit('presence', activeUsers[room]);
        }
      });
    });
  });

  return io;
} 