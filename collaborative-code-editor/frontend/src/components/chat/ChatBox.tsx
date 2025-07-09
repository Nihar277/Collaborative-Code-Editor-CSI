import React, { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useChatStore, useUserStore } from '@/lib/store';

interface ChatBoxProps {
  documentId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ documentId }) => {
  const { messages, setMessages, addMessage } = useChatStore();
  const { user } = useUserStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.on('chat-message', (msg: any) => {
      addMessage(msg);
    });
    return () => {
      socket.off('chat-message');
    };
    // eslint-disable-next-line
  }, [documentId]);

  useEffect(() => {
    async function fetchChat() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/documents/${documentId}/chat`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      setMessages(data);
    }
    if (documentId && user?.token) fetchChat();
    // eslint-disable-next-line
  }, [documentId, user?.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const socket = getSocket();
    const msg = {
      documentId,
      author: user?._id,
      content: input,
      timestamp: new Date().toISOString(),
      type: 'message',
      username: user?.username,
    };
    socket.emit('chat-message', { documentId, message: msg });
    addMessage(msg);
    setInput('');
  };

  return (
    <div className="flex flex-col h-64 border rounded bg-white">
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-semibold text-xs text-blue-700">{msg.username || 'User'}:</span>
            <span className="ml-2 text-sm">{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex p-2 border-t">
        <input
          className="flex-1 px-2 py-1 border rounded mr-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
      </form>
    </div>
  );
};

export default ChatBox; 