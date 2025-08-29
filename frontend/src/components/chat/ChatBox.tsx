"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getSocket } from '@/lib/socket';
import { useChatStore, ChatMessage } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatBoxProps {
  documentId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ documentId }) => {
  const { data: session } = useSession();
  const { messages, setMessages, addMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    // Listen for incoming chat messages
    socket.on('chat-message', (msg: ChatMessage) => {
      addMessage(msg);
    });

    // Fetch existing chat messages
    fetchChatMessages();

    return () => {
      socket.off('chat-message');
    };
  }, [documentId, session?.user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get token from session
      const token = (session?.user as any)?.token || (session as any)?.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat/${documentId}/chat`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err: any) {
      console.error('Failed to fetch chat messages:', err);
      setError('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session?.user) return;

    try {
      const messageData = {
        documentId,
        content: input.trim(),
        type: 'message' as const,
      };

      // Get token from session
      const token = (session?.user as any)?.token || (session as any)?.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Send via API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat/${documentId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const savedMessage = await response.json();
      
      // Emit via socket for real-time updates
      const socket = getSocket();
      socket.emit('chat-message', { 
        documentId, 
        message: {
          ...savedMessage,
          author: {
            _id: (session.user as any)?.id || 'unknown',
            username: (session.user as any)?.username || session.user?.name || 'User',
            avatar: (session.user as any)?.avatar
          }
        }
      });

      // Add to local state
      addMessage({
        ...savedMessage,
        author: {
          _id: (session.user as any)?.id || 'unknown',
          username: (session.user as any)?.username || session.user?.name || 'User',
          avatar: (session.user as any)?.avatar
        }
      });

      setInput('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      clearMessages();
    }
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">Chat</h3>
        <Button
          onClick={handleClearChat}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading messages...
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-sm text-center">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg._id || idx} className="flex flex-col">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-xs text-blue-700">
                      {msg.author?.username || 'User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1 break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t p-3">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm"
            disabled={!session?.user}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || !session?.user}
            className="px-4"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox; 