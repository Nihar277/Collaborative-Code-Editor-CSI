import create from 'zustand';

interface UserState {
  user: any;
  setUser: (user: any) => void;
}

interface DocumentState {
  document: any;
  setDocument: (doc: any) => void;
}

interface EditorState {
  content: string;
  setContent: (content: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

interface ChatState {
  messages: any[];
  setMessages: (msgs: any[]) => void;
  addMessage: (msg: any) => void;
}

interface PresenceState {
  users: any[];
  setUsers: (users: any[]) => void;
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set({ user }),
}));

export const useDocumentStore = create<DocumentState>(set => ({
  document: null,
  setDocument: doc => set({ document: doc }),
}));

export const useEditorStore = create<EditorState>(set => ({
  content: '',
  setContent: content => set({ content }),
  language: 'javascript',
  setLanguage: lang => set({ language: lang }),
}));

export const useChatStore = create<ChatState>(set => ({
  messages: [],
  setMessages: msgs => set({ messages: msgs }),
  addMessage: msg => set(state => ({ messages: [...state.messages, msg] })),
}));

export const usePresenceStore = create<PresenceState>(set => ({
  users: [],
  setUsers: users => set({ users }),
})); 