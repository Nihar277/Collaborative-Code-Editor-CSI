"use client";
import React, { useEffect, useState, useCallback } from 'react';
import CodeEditor from './CodeEditor';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useEditorStore, usePresenceStore, useUserStore } from '@/lib/store';
import { UserPresence } from '@/lib/store';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  language: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ 
  documentId, 
  initialContent, 
  language 
}) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { content, setContent, setIsDirty } = useEditorStore();
  const { users, setUsers, addUser, removeUser, clearUsers } = usePresenceStore();
  const { user } = useUserStore();

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    debounce(() => {
      setIsTyping(false);
      const socket = getSocket();
      socket.emit('user-typing', { documentId, userId: user?._id });
    }, 1000),
    [documentId, user?._id]
  );

  useEffect(() => {
    if (!user?._id || !documentId) return;

    setContent(initialContent);
    const socket = getSocket();
    
    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join document room
    socket.emit('join-document', { 
      documentId, 
      userId: user._id, 
      username: user.username 
    });
    setSocketConnected(true);

    // Socket event listeners
    socket.on('text-operation', (operation: any) => {
      if (operation.userId !== user._id) {
        setContent(operation.content);
        setIsDirty(false);
      }
    });

    socket.on('presence', (presenceUsers: UserPresence[]) => {
      setUsers(presenceUsers);
    });

    socket.on('user-joined', (newUser: UserPresence) => {
      addUser(newUser);
    });

    socket.on('user-left', (leftUser: { userId: string }) => {
      removeUser(leftUser.userId);
    });

    socket.on('cursor-position', (data: { userId: string; position: any }) => {
      // Handle cursor position updates
      console.log('Cursor position:', data);
    });

    socket.on('user-selection', (data: { userId: string; selection: any }) => {
      // Handle selection updates
      console.log('User selection:', data);
    });

    socket.on('chat-message', (message: any) => {
      // Handle chat messages
      console.log('Chat message:', message);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave-document', { documentId, userId: user._id });
      clearUsers();
      disconnectSocket();
    };
  }, [documentId, user?._id, user?.username, initialContent, setContent, setIsDirty, setUsers, addUser, removeUser, clearUsers]);

  const handleChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    setIsDirty(true);
    
    // Emit text operation to other users
    const socket = getSocket();
    socket.emit('text-operation', { 
      documentId, 
      operation: { 
        content: newContent, 
        userId: user?._id,
        timestamp: Date.now()
      } 
    });

    // Show typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    debouncedTyping();
  };

  const handleCursorChange = (position: any) => {
    const socket = getSocket();
    socket.emit('cursor-position', { 
      documentId, 
      userId: user?._id, 
      position 
    });
  };

  const handleSelectionChange = (selection: any) => {
    const socket = getSocket();
    socket.emit('user-selection', { 
      documentId, 
      userId: user?._id, 
      selection 
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {language.toUpperCase()}
          </span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isTyping && (
            <span className="text-xs text-gray-500 animate-pulse">
              {users.find(u => u.userId !== user?._id)?.username || 'Someone'} is typing...
            </span>
          )}
          <span className="text-xs text-gray-500">
            {users.length} user(s) online
          </span>
        </div>
      </div>
      
      <CodeEditor
        value={content}
        language={language}
        onChange={handleChange}
        onCursorChange={handleCursorChange}
        onSelectionChange={handleSelectionChange}
        theme="vs-dark"
        fontSize={14}
        minimap={true}
        options={{
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: { enabled: true },
          lineNumbers: 'on',
          folding: true,
          find: { addExtraSpaceOnTop: false },
        }}
      />
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default CollaborativeEditor; 