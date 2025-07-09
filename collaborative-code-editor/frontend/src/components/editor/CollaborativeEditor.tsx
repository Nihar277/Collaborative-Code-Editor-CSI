import React, { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';
import { getSocket } from '@/lib/socket';
import { useEditorStore, usePresenceStore, useUserStore } from '@/lib/store';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  language: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId, initialContent, language }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const { content, setContent } = useEditorStore();
  const { users, setUsers } = usePresenceStore();
  const { user } = useUserStore();

  useEffect(() => {
    setContent(initialContent);
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('join-document', { documentId, userId: user?._id, username: user?.username });
    setSocketConnected(true);

    socket.on('text-operation', (newContent: string) => {
      setContent(newContent);
    });
    socket.on('presence', (users: any[]) => {
      setUsers(users);
    });
    // Add more event listeners as needed (cursor, selection, etc.)

    return () => {
      socket.emit('leave-document', { documentId, userId: user?._id });
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [documentId, user?._id]);

  const handleChange = (value: string | undefined) => {
    setContent(value || '');
    const socket = getSocket();
    socket.emit('text-operation', { documentId, operation: value });
  };

  return (
    <div>
      <CodeEditor
        value={content}
        language={language}
        onChange={handleChange}
      />
      <div className="mt-2 text-xs text-gray-500">
        {users.length} user(s) online
      </div>
    </div>
  );
};

export default CollaborativeEditor; 