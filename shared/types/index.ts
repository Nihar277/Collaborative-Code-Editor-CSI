// User Schema
export interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
}

// Document Schema
export interface Document {
  _id: string;
  title: string;
  content: string;
  language: string;
  owner: string;
  collaborators: Array<{
    userId: string;
    permission: 'owner' | 'editor' | 'viewer';
    joinedAt: string;
  }>;
  versions: Array<{
    content: string;
    author: string;
    timestamp: string;
    message: string;
  }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat Schema
export interface ChatMessage {
  _id: string;
  documentId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}
