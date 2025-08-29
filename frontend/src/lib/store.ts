import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  lastActive: string;
  token?: string;
}

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

export interface ChatMessage {
  _id: string;
  documentId: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}

export interface UserPresence {
  userId: string;
  username: string;
  documentId: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface DocumentState {
  document: Document | null;
  setDocument: (doc: Document | null) => void;
  updateDocument: (updates: Partial<Document>) => void;
}

interface EditorState {
  content: string;
  setContent: (content: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

interface ChatState {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

interface PresenceState {
  users: UserPresence[];
  setUsers: (users: UserPresence[]) => void;
  addUser: (user: UserPresence) => void;
  removeUser: (userId: string) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const useDocumentStore = create<DocumentState>((set) => ({
  document: null,
  setDocument: (doc) => set({ document: doc }),
  updateDocument: (updates) => 
    set((state) => ({
      document: state.document ? { ...state.document, ...updates } : null
    })),
}));

export const useEditorStore = create<EditorState>((set) => ({
  content: '',
  setContent: (content) => set({ content }),
  language: 'javascript',
  setLanguage: (lang) => set({ language: lang }),
  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
}));

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, msg] 
  })),
  clearMessages: () => set({ messages: [] }),
}));

export const usePresenceStore = create<PresenceState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({
    users: state.users.some(u => u.userId === user.userId) 
      ? state.users 
      : [...state.users, user]
  })),
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.userId !== userId)
  })),
  clearUsers: () => set({ users: [] }),
})); 